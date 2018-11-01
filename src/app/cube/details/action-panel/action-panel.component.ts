import { CartV2Service, iframeParentID } from '../../../core/cartv2.service';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2, HostListener, Input } from '@angular/core';
import { AuthService, DOWNLOAD_STATUS } from '../../../core/auth.service';
import { environment } from '@env/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { RatingService } from '../../../core/rating.service';
import { ModalService, ModalListElement } from '../../../shared/modals';
import { Subject } from 'rxjs/Subject';
import { ToasterService } from '../../../shared/toaster/toaster.service';
import { Restriction } from '@cyber4all/clark-entity/dist/learning-object';

// TODO move this to clark entity?
export interface Rating {
  id?: string;
  user: User;
  number: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'cube-details-action-panel',
  styleUrls: ['action-panel.component.scss'],
  templateUrl: 'action-panel.component.html'
})
export class ActionPanelComponent implements OnInit, OnDestroy {

  @Input() learningObject: LearningObject;
  @ViewChild('objectLinkElement') objectLinkElement: ElementRef;
  @ViewChild('ratingsWrapper') ratingsWrapper: ElementRef;
  @ViewChild('savesRef') savesRef: ElementRef;

  private isDestroyed$ = new Subject<void>();
  downloadStatus: DOWNLOAD_STATUS = 0;
  downloading = false;
  addingToLibrary = false;
  author: string;
  learningObjectName: string;
  ratings: Rating[] = [];
  averageRating = 0;
  saved = false;
  url: string;
  showAddRating = false;
  windowWidth: number;
  loggedin = false;
  showDownloadModal = false;

  userRating: {user?: User, number?: number, comment?: string, date?: string} = {};

  contributorsList = [];
  iframeParent = iframeParentID;
  error = false;
  userIsAuthor = false;

  public tips = TOOLTIP_TEXT;

  @HostListener('window:keyup', ['$event']) handleKeyUp(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      this.showAddRating = false;
    }
  }

  @HostListener('window:resize', ['$event']) handleResize(event) {
    this.windowWidth = event.target.outerWidth;
  }

  constructor(
    public auth: AuthService,
    private cartService: CartV2Service,
    private renderer: Renderer2,
    private noteService: ToasterService,
  ) {}

  ngOnInit() {
    this.auth.isLoggedIn.subscribe(val => {
      this.loggedin = val;
      this.auth.userCanDownload(this.learningObject).then(isAuthorized => {
        this.downloadStatus = isAuthorized;
      });
    });

    this.url = this.buildLocation();
    this.saved = this.cartService.has(this.learningObject);
    const userName = this.auth.username;
    this.userIsAuthor = (this.learningObject.author.username === userName);
  }

  get canDownload(): boolean {
    return this.downloadStatus === DOWNLOAD_STATUS.CAN_DOWNLOAD;
  }

  get isReleased(): boolean {
    return this.downloadStatus !== DOWNLOAD_STATUS.NOT_RELEASED;
  }



  async addToCart(download?: boolean) {
    this.error = false;

    if (!download) {
      // we don't want the add to library button spinner on the 'download' action
      this.addingToLibrary = true;
    } else {
      this.downloading = true;
    }

    if (download) {
      this.download(
        this.learningObject.author.username,
        this.learningObject.name
      );
    }

    try {
      if (!this.userIsAuthor) {
        await this.cartService.addToCart(this.learningObject.author.username, this.learningObject.name);

        this.saved = this.cartService.has(this.learningObject);

        if (!this.saved) {
          this.animateSaves();
        }
      }
    } catch (error) {
      console.log(error);
      this.noteService.notify(
        'Error!',
        'There was an error adding to your library',
        'bad',
        'far fa-times'
      );
    }
    this.addingToLibrary = false;
  }

  download(author: string, learningObjectName: string) {
    this.downloading = true;
    const loaded = this.cartService
      .downloadLearningObject(author, learningObjectName)
      .takeUntil(this.isDestroyed$);

    this.toggleDownloadModal(true);

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

  toggleDownloadModal(val?: boolean) {
    this.showDownloadModal = val;
    // if (!val) {
    //   this.showDownloadModal = val;
    // } else if (!localStorage.getItem('downloadWarning')) {
    //   this.showDownloadModal = val;
    //   localStorage.setItem('downloadWarning', 'true');
    // }
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

  scrollToRatings() {
    document.body.scrollTop = document.documentElement.scrollTop = this.ratingsWrapper.nativeElement.offsetTop;
  }

  get isMobile() {
    return this.windowWidth <= 750;
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
