import { CartV2Service, iframeParentID } from '../../../core/cartv2.service';
import { LearningObjectService } from './../../learning-object.service';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { environment } from '@env/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { NotificationService } from '../../../shared/notifications/notification.service';
import { UserService } from '../../../core/user.service';
import { Subscription } from 'rxjs/Subscription';
import { RatingService } from '../../../core/rating.service';
import { ModalService, ModalListElement } from '../../../shared/modals';

// TODO move this to clark entity?
export interface Rating {
  id?: string;
  user: User;
  number: number;
  comment: string;
  date: string;
}


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
  ratings: Rating[] = [];
  averageRating = 0;
  saved = false;
  url: string;
  showAddRating = false;
  windowWidth: number;
  loggedin = false;

  userRating: {user?: User, number?: number, comment?: string, date?: string} = {};

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
    private ratingService: RatingService,
    private modalService: ModalService
  ) {
    this.windowWidth = window.outerWidth;
  }

  ngOnInit() {
    this.subs.push(this.route.params.subscribe(params => {
      this.author = params['username'];
      this.learningObjectName = params['learningObjectName'];
    }));

    this.subs.push(this.auth.isLoggedIn.subscribe(val => {
      // update loggedin flag when auth status changes
      this.loggedin = val;
    }));

    this.fetchLearningObject();

    // FIXME: Hotfix for white listing. Remove if functionality is extended or removed
    if (environment.production) {
      this.checkWhitelist();
    } else {
      this.canDownload = true;
    }
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

  submitNewRating(rating: {number: number, comment: string, editing?: boolean, id?: string}) {
    if (!rating.editing) {
      // creating
      delete rating.editing;
      this.ratingService.createRating(this.author, this.learningObject.name, rating as Rating).then(() => {
        this.getLearningObjectRatings();
        this.showAddRating = false;
        this.noteService.notify('Success!', 'Review submitted successfully!', 'good', 'far fa-check');
      });
    } else {
      // editing
      // TODO rating id?
      delete rating.editing;
      if (!rating.id) {
        this.noteService.notify('Error!', 'An error occured and your rating could not be updated', 'bad', 'far fa-times');
        console.error('Error: rating id not set');
        return;
      }
      this.ratingService.editRating(this.author, this.learningObjectName, rating.id , rating as Rating).then(() => {
        this.getLearningObjectRatings();
        this.showAddRating = false;
        this.noteService.notify('Success!', 'Review updated successfully!', 'good', 'far fa-check');
      }, error => {
        this.showAddRating = false;
        this.noteService.notify('Error!', 'An error occured and your rating could not be updated', 'bad', 'far fa-times');
        console.error(error);
      });
    }
  }

  async deleteRating(index) {
    // 'index' here is the index in the ratings array to delete
    const t = await this.modalService.makeDialogMenu(
      'ratingDelete',
      'Are you sure you want to delete this rating?',
      'You cannot undo this action!',
      false,
      'title-bad',
      'center',
      [
        new ModalListElement('Yup, do it!', 'delete', 'bad'),
        new ModalListElement('No wait!', 'cancel', 'neutral on-white'),
      ]
    ).toPromise();

    if (t === 'delete') {
      this.ratingService.deleteRating(this.author, this.learningObjectName, this.ratings[index].id).then(val => {
        this.getLearningObjectRatings();
        this.noteService.notify('Success!', 'Rating deleted successfully!.', 'good', 'far fa-times');
      }).catch(() => {
        this.noteService.notify('Error!', 'Rating couldn\'t be deleted', 'bad', 'far fa-times');
      });
    }
  }

  reportRating(rating: {concern: string, index: number, comment?: string}) {
    const ratingId = this.ratings[rating.index].id;
    delete rating.index;

    if (ratingId) {
      this.ratingService.flagLearningObjectRating(this.author, this.learningObjectName, ratingId, rating).then(val => {
        this.noteService.notify('Success!', 'Report submitted successfully!', 'good', 'far fa-check');
      }, error => {
        this.noteService.notify('Error!', 'An error occured and your report could not be submitted', 'bad', 'far fa-times');
      })
    } else {
      this.noteService.notify('Error!', 'An error occured and your report could not be submitted', 'bad', 'far fa-times');
      console.error('No ratingId specified');
    }
  }

  private async getLearningObjectRatings() {
    this.ratingService.getLearningObjectRatings(this.author, this.learningObjectName).then(val => {
      this.ratings = val.ratings;
      this.averageRating = val.avgRating;
      const u = this.auth.username;

      for (let i = 0, l = val.ratings.length; i < l; i++) {
        if (u === val.ratings[i].user.username) {
          // this is the user's rating
          // we deep copy this to prevent direct modification from component subtree
          this.userRating = Object.assign({}, val.ratings[i]);
          return;
        }
      }

      // if we found the rating, we've returned from the function at this point
      this.userRating = {};
    });
  }

  // get averageRating(): number {
  //   if (this.ratings.length > 0) {
  //     return this.ratings.map(x => x.number).reduce((x, y) => x + y) / this.ratings.length;
  //   }
  // }

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
