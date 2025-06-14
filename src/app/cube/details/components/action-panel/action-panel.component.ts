import {
  Component,
  ElementRef,
  HostListener,
  Input, OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { LearningObject } from '../../../../../entity/learning-object/learning-object';
import { AuthService } from 'app/core/auth-module/auth.service';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { Subject } from 'rxjs';
import { LibraryService } from 'app/core/library-module/library.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { takeUntil } from 'rxjs/operators';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { Router } from '@angular/router';
import { NavbarDropdownService } from '../../../../core/client-module/navBarDropdown.service';
import { BUNDLING_ROUTES } from 'app/core/learning-object-module/bundling/bundling.routes';
import { BundlingService } from 'app/core/learning-object-module/bundling/bundling.service';
import { EditorialService } from 'app/core/learning-object-module/editorial.service';


@Component({
  selector: 'cube-details-action-panel',
  styleUrls: ['action-panel.component.scss'],
  templateUrl: 'action-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionPanelComponent implements OnInit, OnDestroy {

  @Input() learningObject: LearningObject;
  @Input() revisedVersion: boolean;
  @Input() reviewer: boolean;
  @Input() revisedDate: Date;
  @Input() releasedDate: Date;
  @Input() isRevision: boolean;
  @Input() hasRevision: boolean;
  @Input() revisedLearningObject: LearningObject;
  @ViewChild('objectLinkElement') objectLinkElement: ElementRef;
  @ViewChild('objectAttributionElement') objectAttributionElement: ElementRef;
  @ViewChild('savesRef') savesRef: ElementRef;

  serviceOutageMessage =
    'We\'re currently experiencing network issues that are affecting downloads and libraries. ' +
    'Both have been disabled while we work to resolve the issues. Please check back later.';

  private destroyed$ = new Subject<void>();
  hasDownloadAccess = false;
  hasReviewerAccess = false;
  downloading = false;
  addingToLibrary = false;
  author: string;
  learningObjectName: string;
  collectionName = '';
  saved = false;
  url: string;
  windowWidth: number;
  loggedin = false;
  showDownloadModal = false;
  userCanRevise = false;
  userDropdown: boolean;

  contributorsList = [];
  error = false;
  userIsAuthor = false;

  public tips = TOOLTIP_TEXT;


  @HostListener('window:resize', ['$event']) handleResize(event) {
    this.windowWidth = event.target.outerWidth;
  }

  constructor(
    public auth: AuthService,
    private libraryService: LibraryService,
    private renderer: Renderer2,
    private toaster: ToastrOvenService,
    private changeDetectorRef: ChangeDetectorRef,
    private collectionService: CollectionService,
    private router: Router,
    private dropdowns: NavbarDropdownService,
    private bundlingService: BundlingService,
    private editorialService: EditorialService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.userIsAuthor = (this.learningObject.author.username === this.auth.username);
    this.auth.group
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.userCanRevise = this.auth.hasEditorAccess() || this.userIsAuthor;
        this.hasReviewerAccess = this.auth.hasReviewerAccess();
      });
    this.hasDownloadAccess = (this.hasReviewerAccess || this.isReleased) && this.auth.user !== null;

    this.url = this.buildLocation();
    // FIXME: Fault where 'libraryService.libraryItems' is returned null when it is supposed to be initialized in clark.component
    await this.libraryService.getLibrary({ learningObjectCuid: this.learningObject.cuid, version: this.learningObject.version });
    this.saved = this.libraryService.has(this.learningObject.id);
    this.getCollection();
    this.libraryService.loaded
      .subscribe(val => {
        this.downloading = (val);
        this.changeDetectorRef.markForCheck();
      });
    this.dropdowns.userDropdown.subscribe(val => {
      this.userDropdown = val;
    });
  }

  get isReleased(): boolean {
    return this.learningObject.status === LearningObject.Status.RELEASED;
  }

  get isSubmitted(): boolean {
    return this.learningObject.status !== LearningObject.Status.UNRELEASED;
  }

  async addToLibrary(download?: boolean) {
    this.error = false;

    if (!download) {
      // we don't want the add to library button spinner on the 'download' action
      this.addingToLibrary = true;
    }
    if (download) {
      this.download(
        this.learningObject.id
      );
    }
    if (!this.userIsAuthor && this.isReleased) {
      this.saved = this.libraryService.has(this.learningObject.id);

      if (!this.saved) {
        try {
          await this.libraryService.addToLibrary(this.learningObject.cuid, this.learningObject.version);

          this.toaster.success('Successfully Added!', 'Learning Object added to your library');
          this.saved = true;
          this.animateSaves();
        } catch (err: any) {
          if (err.status !== 201) {
            this.toaster.error('Error!', 'There was an error adding to your library');
            this.addingToLibrary = false;
            this.changeDetectorRef.detectChanges();
            return;
          } else {
            // Do nothing if status is 201.
          }
        }
      }
    }

    this.libraryService.getLibrary({ learningObjectCuid: this.learningObject.cuid });
    this.addingToLibrary = false;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Triggers a bundling process for the learning object
   */
  async toggleBundle() {
    this.toaster.alert('Ready to Bundle...', 'This learning object is queued for bundling.');
    await this.bundlingService.bundleLearningObject(this.learningObject.id);
  }


  /**
   * Download the revised copy of a learning object. This does not add the object to the users cart
   *
   * @param download boolean determines if download takes place
   */
  downloadRevised(download?: boolean) {
    if (download) {
      this.download(
        this.learningObject.id
      );
    }
  }

  /**
   * Function to download the learning object zip file
   *
   * @param learningObjectId the unique mongo id of a learning object
   */

  download(learningObjectId: string) {
    this.toggleDownloadModal(true);
    this.libraryService.downloadBundle(BUNDLING_ROUTES.DOWNLOAD_BUNDLE(learningObjectId));
  }

  copyLink() {
    const el = this.objectLinkElement.nativeElement;
    el.select();
    document.execCommand('copy');

    this.toaster.success('Success!', 'Learning object link copied to your clipboard!');
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

    this.toaster.success('Success!', 'Attribution information has been copied to your clipboard!');
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
        }, (response) => { });
        break;
      case 'twitter':
        const text = 'Check out this learning object on CLARK! ClarkCan';
        window.open('http://twitter.com/share?url='
          + encodeURIComponent(this.url) + '&text='
          + encodeURIComponent(text), '', 'left=0,top=0,width=550,height=450,personalbar=0,toolbar=0,scrollbars=0,resizable=0');

        break;
      case 'linkedin':
        const payload = {
          'comment': 'Check out this learning object on CLARK! ' + this.url + ' #ClarkCan',
          'visibility': {
            'code': 'anyone'
          }
        };
        // eslint-disable-next-line max-len
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

  removeFromLibrary() {
    this.libraryService.removeFromLibrary(this.learningObject.id);
  }

  private buildLocation(encoded?: boolean) {
    const u = window.location.protocol + '//' + window.location.host +
      '/details' +
      '/' + encodeURIComponent(this.learningObject.author.username) +
      '/' + encodeURIComponent(this.learningObject.cuid)
      + '/' + encodeURIComponent(this.learningObject.version);

    return encoded ? encodeURIComponent(u) : u;
  }

  animateSaves() {
    const saves = this.learningObject.metrics.saves + 1;

    this.renderer.addClass(this.savesRef.nativeElement, 'animate');
    this.learningObject.metrics.saves = saves;

    setTimeout(() => {
      this.renderer.removeClass(this.savesRef.nativeElement, 'animate');
    }, 1000);
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
      await this.auth.validateToken();

      if (!this.auth.user.emailVerified) {
        await this.auth.sendEmailVerification().toPromise();
        this.toaster.success(
          `Success!`,
          `Email sent to ${this.auth.user.email}.
            Please check your inbox and spam.
            If you don't receive an email within 15 minutes reach out to info@secured.team.`
        );
      }
    } catch (e) {
      this.toaster.error(`Could not send email`, `${e}`);
    }
  }

  getContributorAttribution() {
    let attribution = '';
    if (this.learningObject.contributors && this.learningObject.contributors.length >= 3) {
      // 3 or more contributors: 'a, b, and c'
      for (let i = 0; i < this.learningObject.contributors.length; i++) {
        const name = this.capitalizeName(this.learningObject.contributors[i].name);

        attribution += i === this.learningObject.contributors.length - 1 ?
          'and ' + name : name + ', ';
      }
    } else if (this.learningObject.contributors && this.learningObject.contributors.length > 0) {
      // 1 or 2 contributors: 'a' or 'a and b'
      attribution = this.capitalizeName(this.learningObject.contributors[0].name);
      if (this.learningObject.contributors.length === 2) {
        attribution += ' and ' + this.capitalizeName(this.learningObject.contributors[1].name);
      }
    } else {
      // No contributors added
      attribution = 'List of Contributors';
    }
    return attribution;
  }

  private capitalizeName(name) {
    return name.replace(/\b(\w)/g, s => s.toUpperCase());
  }

  async getCollection() {
    const collection = await this.collectionService.getCollection(this.learningObject.collection);
    this.collectionName = collection.name;
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
