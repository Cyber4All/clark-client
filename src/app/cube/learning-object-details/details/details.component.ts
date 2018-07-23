import { CartV2Service, iframeParentID } from '../../../core/cartv2.service';
import { LearningObjectService } from './../../learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { environment } from '@env/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { NotificationService } from '../../../shared/notifications/notification.service';
import { UserService } from '../../../core/user.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'cube-learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  @ViewChild('savesRef') savesRef: ElementRef;
  @ViewChild('objectLinkElement') objectLinkElement: ElementRef;

  private subs: Subscription[] = [];
  downloading = false;
  addingToLibrary = false;
  author: string;
  learningObjectName: string;
  learningObject: LearningObject;
  returnUrl: string;
  saved = false;
  url: string;
  error = false;
  errorMessage: String = '';

  contributorsList = [];

  canDownload = false;
  iframeParent = iframeParentID;

  public tips = TOOLTIP_TEXT;

  constructor(
    private learningObjectService: LearningObjectService,
    private cartService: CartV2Service,
    public userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private renderer: Renderer2,
    private noteService: NotificationService
  ) {}

  ngOnInit() {
    this.subs.push(this.route.params.subscribe(params => {
      this.author = params['username'];
      this.learningObjectName = params['learningObjectName'];
    }));

    this.fetchLearningObject();

    // FIXME: Hotfix for white listing. Remove if functionality is extended or removed
    if (environment.production) {
      this.checkWhitelist();
    } else {
      this.canDownload = true;
    }

    this.returnUrl =
      '/browse/details/' +
      this.route.snapshot.params['username'] +
      '/' +
      this.route.snapshot.params['learningObjectName'];
  }

  // FIXME: Hotfix for white listing. Remove if functionality is extended or removed
  private async checkWhitelist() {
    try {
      const response = await fetch(environment.whiteListURL);
      const object = await response.json();
      const whitelist: string[] = object.whitelist;
      const username = this.auth.username;
      if (whitelist.includes(username)) {
        this.canDownload = true;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async fetchLearningObject() {
    try {
      this.learningObject = await this.learningObjectService.getLearningObject(
        this.author,
        this.learningObjectName
      );
      if (this.learningObject.contributors) {
        // The array of contributors attached to the learning object contains a
        // list of usernames. We want to display their full names.
        this.getContributors();
      }
      this.url = this.buildLocation();
    } catch (e) {
      console.log(e);
    }
    this.saved = this.cartService.has(this.learningObject);
  }

  async addToCart(download?: boolean) {
    this.error = false;

    if (!download) {
      // we don't want the add to library button spinner on the 'download' action
      this.addingToLibrary = true;
    } else {
      this.downloading = true;
    }

    try {
      const val = await this.cartService.addToCart(
        this.author,
        this.learningObjectName
      );
    } catch (error) {
      this.error = true;
      this.errorMessage = 'Failed to add to your library';
      console.log(this.errorMessage);
    }

    if (!this.saved && !this.error) {
      this.animateSaves();
    }

    this.saved = this.cartService.has(this.learningObject);
    this.addingToLibrary = false;

    if (download) {
      try {
        this.download(
          this.learningObject.author.username,
          this.learningObject.name
        );
      } catch (e) {
        console.log(e);
      }
    }
  }

  async clearCart() {
    try {
      await this.cartService.clearCart();
    } catch (e) {
      console.log(e);
    }
  }

  download(author: string, learningObjectName: string) {
    this.downloading = true;
    const loaded = this.cartService.downloadLearningObject(
      author,
      learningObjectName
    );
    this.subs.push(
      loaded.subscribe(finished => {
        if (finished) {
          this.downloading = false;
        }
      })
    );
  }

  copyLink() {
    const el = this.objectLinkElement.nativeElement;
    el.select();
    document.execCommand('copy');

    this.noteService.notify('Success!', 'Learning object link copied to your clipboard!', 'good', 'far fa-check');
  }

  animateSaves() {
    const saves = this.learningObject.metrics.saves + 1;

    this.renderer.addClass(this.savesRef.nativeElement, 'animate');

    setTimeout(() => {
      this.learningObject.metrics.saves = saves;

      setTimeout(() => {
        this.renderer.removeClass(this.savesRef.nativeElement, 'animate');
      }, 1000);
    }, 400);
  }

  shareButton(event, type) {
    switch (type) {
      case 'facebook':
      // ignoring since the FB object is set in an imported script outside of typescripts scope
      // @ts-ignore
        FB.ui({
          method: 'share',
          href: this.url,
        }, function(response){});
        break;
      case 'twitter':
        const text = 'Check out this learning object on CLARK!';
        window.open('http://twitter.com/share?url='
          + encodeURIComponent(this.url) + '&text='
          + encodeURIComponent(text), '', 'left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0');

        break;
      case 'linkedin':
        const payload = {
          'comment': 'Check out this learning object on CLARK! ' + this.url,
          'visibility': {
            'code': 'anyone'
          }
        };
        // tslint:disable-next-line:max-line-length
        window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + this.buildLocation(true));
        break;
      case 'email':
        window.location.href = 'mailto:?subject=Check out this learning object on CLARK!&body=' + this.buildLocation(true);
        break;
      case 'copyLink':
        this.copyLink();
        break;
    }

    this.animateShareButton(event);
  }

  animateShareButton(event) {
    const el = event.currentTarget;

    this.renderer.addClass(el, 'animated');

    setTimeout(() => {
      this.renderer.removeClass(el, 'animated');
    }, 600);
  }

  removeFromCart() {
    this.cartService.removeFromCart(this.author, this.learningObjectName);
  }

  private buildLocation(encoded?: boolean) {
    const u = window.location.protocol + '//' + window.location.host +
    '/details' +
    '/' + encodeURIComponent(this.learningObject.author.username) +
    '/' + encodeURIComponent(this.learningObjectName);

    return encoded ? encodeURIComponent(u) : u;
  }

  private getContributors() {
    for (let i = 0; i < this.learningObject.contributors.length; i++) {
      this.userService
        .getUser(this.learningObject.contributors[i])
        .then(val => {
          this.contributorsList[i] = val;
        });
    }
  }

  ngOnDestroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
