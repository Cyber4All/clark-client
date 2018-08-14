import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { environment } from '@env/environment';
import { AuthService } from '../../../core/auth.service';
import { CartV2Service } from '../../../core/cartv2.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { NotificationService } from '../../../shared/notifications';
import { TOOLTIP_TEXT } from '@env/tooltip-text';

@Component({
  selector: 'cube-details-action-panel',
  styleUrls: ['action-panel.component.scss'],
  templateUrl: 'action-panel.component.html'
})
export class ActionPanelComponent implements OnInit {

  @Input() learningObject: LearningObject;
  @ViewChild('objectLinkElement') objectLinkElement: ElementRef;
  @ViewChild('savesRef') savesRef: ElementRef;

  canDownload = false;
  downloading = false;
  addingToLibrary = false;
  saved = false;
  url: string;

  public tips = TOOLTIP_TEXT;

  constructor(
    private auth: AuthService,
    private cartService: CartV2Service,
    private renderer: Renderer2,
    private noteService: NotificationService,
  ) { }

  ngOnInit() {
    // FIXME: Hotfix for white listing. Remove if functionality is extended or removed
    if (environment.production) {
      this.checkWhitelist();
    } else {
      this.canDownload = true;
    }
    this.url = this.buildLocation();
    this.saved = this.cartService.has(this.learningObject);
  }

  async addToCart(download?: boolean) {
    if (!download) {
      // we don't want the add to library button spinner on the 'download' action
      this.addingToLibrary = true;
    } else {
      this.downloading = true;
    }
    const val = await this.cartService.addToCart(
      this.learningObject.author.username,
      this.learningObject.name
    );

    if (!this.saved) {
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

  download(author: string, learningObjectName: string) {
    this.downloading = true;
    const loaded = this.cartService.downloadLearningObject(
      author,
      learningObjectName
    );
    // FIXME: Takeuntil unsub
    loaded.subscribe(finished => {
      if (finished) {
        this.downloading = false;
      }
    });
  }

  copyLink() {
    const el = this.objectLinkElement.nativeElement;
    el.select();
    document.execCommand('copy');

    this.noteService.notify('Success!', 'Learning object link copied to your clipboard!', 'good', 'far fa-check');
  }

  shareButton(event, type) {
    switch (type) {
      case 'facebook':
        // ignoring since the FB object is set in an imported script outside of typescripts scope
        // @ts-ignore
        FB.ui({
          method: 'share',
          href: this.url,
        }, function (response) { });
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
    this.cartService.removeFromCart(this.learningObject.author.username, this.learningObject.name);
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

  private buildLocation(encoded?: boolean) {
    const u = window.location.protocol + '//' + window.location.host +
      '/details' +
      '/' + encodeURIComponent(this.learningObject.author.username) +
      '/' + encodeURIComponent(this.learningObject.name);

    return encoded ? encodeURIComponent(u) : u;
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
}
