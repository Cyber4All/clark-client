import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { LearningObject, User } from '@entity';
import { AuthService, DOWNLOAD_STATUS } from '../../../core/auth.service';
import { environment } from '@env/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { Subject } from 'rxjs';
import { CartV2Service, iframeParentID } from '../../../core/cartv2.service';
import { ToasterService } from '../../../shared/toaster/toaster.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cube-details-action-panel',
  styleUrls: ['action-panel.component.scss'],
  templateUrl: 'action-panel.component.html'
})
export class ActionPanelComponent implements OnInit, OnDestroy {

  @Input() learningObject: LearningObject;
  @Input() revisedVersion: boolean;
  @Input() reviewer: boolean;
  @Input() revisedDate: Date;
  @Input() releasedDate: Date;
  @ViewChild('objectLinkElement') objectLinkElement: ElementRef;
  @ViewChild('objectAttributionElement') objectAttributionElement: ElementRef;
  @ViewChild('savesRef') savesRef: ElementRef;

  private destroyed$ = new Subject<void>();
  hasDownloadAccess = false;
  downloading = false;
  addingToLibrary = false;
  author: string;
  learningObjectName: string;
  saved = false;
  url: string;
  windowWidth: number;
  loggedin = false;
  showDownloadModal = false;
  userCanRevise = false;

  contributorsList = [];
  iframeParent = iframeParentID;
  error = false;
  userIsAuthor = false;

  public tips = TOOLTIP_TEXT;


  @HostListener('window:resize', ['$event']) handleResize(event) {
    this.windowWidth = event.target.outerWidth;
  }

  constructor(
    public auth: AuthService,
    private cartService: CartV2Service,
    private renderer: Renderer2,
    private toaster: ToasterService,
  ) { }

  ngOnInit() {
    this.auth.group
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.userCanRevise = this.auth.hasEditorAccess();
      });
    this.hasDownloadAccess = (this.auth.hasReviewerAccess() || this.isReleased) && this.auth.user && this.auth.user.emailVerified;

    this.url = this.buildLocation();
    this.saved = this.cartService.has(this.learningObject);
    const userName = this.auth.username;
    this.userIsAuthor = (this.learningObject.author.username === userName);
  }

  get isReleased(): boolean {
    return this.learningObject.status === LearningObject.Status.RELEASED;
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
      this.toaster.notify(
        'Error!',
        'There was an error adding to your library',
        'bad',
        'far fa-times'
      );
    }
    this.addingToLibrary = false;
  }

  /**
   * Download the revised copy of a learning object. This does not add the object to the users cart
   * @param download boolean determines if download takes place
   */
  downloadRevised(download?: boolean) {
    if (download) {
      this.download(
        this.learningObject.author.username,
        this.learningObject.name
      );
    }
  }


  download(author: string, learningObjectName: string) {
    this.downloading = true;
    const loaded = this.cartService
      .downloadLearningObject(author, learningObjectName, this.revisedVersion).pipe(
      takeUntil(this.destroyed$));

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

    this.toaster.notify('Success!', 'Learning object link copied to your clipboard!', 'good', 'far fa-check');
  }

  /**
   * Copy the Creative Commons Attribution to the clipboard
   *
  */
  copyAttribution() {
    const range = document.createRange();
    range.selectNode(document.getElementById('objectAttribution'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();

    this.toaster.notify('Success!', 'Attribution information has been copied to your clipboard!', 'good', 'far fa-check');
  }

  toggleDownloadModal(val?: boolean) {
    this.showDownloadModal = val;
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

  get isMobile() {
    return this.windowWidth <= 750;
  }

  /**
   * Sends email verification email
   *
   * @memberof UserInformationComponent
   */
  public async sendEmailVerification() {
    try {
      await this.auth.validate();

      if (!this.auth.user.emailVerified) {
        await this.auth.sendEmailVerification().toPromise();
        this.toaster.notify(
          `Success!`,
          `Email sent to ${this.auth.user.email}. Please check your inbox and spam.`,
          'good',
          'far fa-check'
        );
      }
    } catch (e) {
      this.toaster.notify(`Could not send email`, `${e}`, 'bad', '');
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
