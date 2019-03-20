import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { AuthService, DOWNLOAD_STATUS } from '../../../core/auth.service';
import { environment } from '@env/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { Subject } from 'rxjs';
import { CartV2Service, iframeParentID } from '../../../core/cartv2.service';
import { ToasterService } from '../../../shared/toaster/toaster.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-reviewer-panel',
  templateUrl: './reviewer-panel.component.html',
  styleUrls: ['./reviewer-panel.component.scss']
})
export class ReviewerPanelComponent implements OnInit {
  @Input() learningObject: LearningObject;
  @ViewChild('objectLinkElement') objectLinkElement: ElementRef;
  @ViewChild('ratingsWrapper') ratingsWrapper: ElementRef;
  @ViewChild('savesRef') savesRef: ElementRef;

  private destroyed$ = new Subject<void>();
  hasDownloadAccess = false;
  downloading = false;
  addingToLibrary = false;
  author: string;
  learningObjectName: string;
  saved = false;
  url: string;
  showAddRating = false;
  windowWidth: number;
  loggedin = false;
  showDownloadModal = false;
  isEditButtonViewable = false;

  userRating: { user?: User, number?: number, comment?: string, date?: string } = {};

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
  ) { }

  ngOnInit() {
    this.auth.group
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.isEditButtonViewable = this.auth.hasEditorAccess();
      });
    this.hasDownloadAccess = this.auth.hasReviewerAccess();
    this.url = this.buildLocation();
    this.saved = this.cartService.has(this.learningObject);
    const userName = this.auth.username;
    this.userIsAuthor = (this.learningObject.author.username === userName);
  }

  async addToCart(download?: boolean) {
    this.error = false;
    this.downloading = true;

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
      .downloadLearningObject(author, learningObjectName).pipe(
      takeUntil(this.destroyed$));

    this.toggleDownloadModal(true);

    loaded.subscribe(finished => {
      if (finished) {
        this.downloading = false;
      }
    });
  }

  private buildLocation(encoded?: boolean) {
    const u = window.location.protocol + '//' + window.location.host +
      '/details' +
      '/' + encodeURIComponent(this.learningObject.author.username) +
      '/' + encodeURIComponent(this.learningObject.name);

    return encoded ? encodeURIComponent(u) : u;
  }

  toggleDownloadModal(val?: boolean) {
    this.showDownloadModal = val;
  }
}
