import { CartV2Service, iframeParentID } from '../../../core/cartv2.service';
import { LearningObjectService } from './../../learning-object.service';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2, HostListener, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { environment } from '@env/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { NotificationService } from '../../../shared/notifications/notification.service';
import { UserService } from '../../../core/user.service';
import { Subscription } from 'rxjs/Subscription';
import { RatingService } from '../../../core/rating.service';


@Component({
  selector: 'cube-learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  @ViewChild('savesRef') savesRef: ElementRef;
  @ViewChild('objectLinkElement') objectLinkElement: ElementRef;
  @ViewChild('ratingsWrapper') ratingsWrapper: ElementRef;

  private subs: Subscription[] = [];
  downloading = false;
  addingToLibrary = false;
  author: string;
  learningObjectName: string;
  learningObject: LearningObject;
  ratings: {user: User, number: number, comment: string, date: string}[] = [];
  returnUrl: string;
  saved = false;
  url: string;
  showAddRating = false;
  showEditRating = false;
  showDeleteRating = false;
  isQuerying = false;
  editRatingObject: {number: number, comment: string, index: number};
  deleteRatingIndex: number;
  windowWidth: number;

  userRating: number;

  contributorsList = [];

  canDownload = false;
  iframeParent = iframeParentID;

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
    private learningObjectService: LearningObjectService,
    private cartService: CartV2Service,
    public userService: UserService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private renderer: Renderer2,
    private noteService: NotificationService,
    private ratingService: RatingService
  ) {
    this.windowWidth = window.outerWidth;
  }

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
    // Get reviews for specified learning object
    this.getLearningObjectRatings();
  }

  async addToCart(download?: boolean) {
    if (!download) {
      // we don't want the add to library button spinner on the 'download' action
      this.addingToLibrary = true;
    } else {
      this.downloading = true;
    }
    const val = await this.cartService.addToCart(
      this.author,
      this.learningObjectName
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

  async submitNewRating(rating: {number: number, comment: string}) {
    this.ratingService.createRating(rating, this.learningObject.name).then(() => {
      this.getLearningObjectRatings();
      this.showAddRating = false;
      this.noteService.notify('Success!', 'Review submitted successfully!', 'good', 'far fa-check');
    });
  }

  editRating(rating: {number: number, comment: string, index: number}) {
    this.showEditRating = true;
    this.editRatingObject = {
      number: rating.number,
      comment: rating.comment,
      index: rating.index
    };
  }

  submitEditRating(rating: {number: number, comment: string }) {
    const ratingId = this.getRatingId(this.editRatingObject.index);
    this.ratingService.editRating(ratingId, this.learningObjectName, rating).then(() => {
      this.getLearningObjectRatings();
      this.showEditRating = false;
      this.noteService.notify('Success!', 'Review successfully updated!', 'good', 'far fa-check');
    });
  }

  deleteRating(index: number) {
    this.showDeleteRating = true;
    this.deleteRatingIndex = index;
  }

  submitDeleteRating() {
    const ratingId = this.getRatingId(this.deleteRatingIndex);
    this.ratingService.deleteRating(ratingId, this.learningObjectName).then(() => {
      this.getLearningObjectRatings();
      this.showDeleteRating = false;
      this.noteService.notify('Success!', 'Review successfully deleted!', 'good', 'far fa-check');
    });
  }

  private async getLearningObjectRatings() {
    this.ratings = await this.ratingService.getLearningObjectRatings(this.learningObjectName);
  }

  private getRatingId(index: number) {
    return this.ratings['ratings'][index]['_id'];
  }

  get averageRating(): number {
    if (this.ratings.length > 0) {
      return this.ratings.map(x => x.number).reduce((x, y) => x + y) / this.ratings.length;
    }
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

  scrollToRatings() {
    document.body.scrollTop = document.documentElement.scrollTop = this.ratingsWrapper.nativeElement.offsetTop;
  }

  get isMobile() {
    return this.windowWidth <= 750;
  }

  ngOnDestroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
