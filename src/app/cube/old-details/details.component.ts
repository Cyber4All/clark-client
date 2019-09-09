
import { takeUntil } from 'rxjs/operators';
import { iframeParentID } from '../../core/cartv2.service';
import { LearningObjectService } from '../learning-object.service';
import { LearningObject, User } from '@entity';
import { Component, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/user.service';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { RatingService } from '../../core/rating.service';
import { UriRetrieverService } from '../../core/uri-retriever.service';
import { ToasterService } from '../../shared/modules/toaster/toaster.service';
import { ModalService, ModalListElement } from '../../shared/modules/modals/modal.module';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangelogService } from 'app/core/changelog.service';

// TODO move this to clark entity?
export interface Rating {
  id?: string;
  user: User;
  value: number;
  comment: string;
  date: number;
  source?: string;
  response?: object;
}

@Component({
  selector: 'cube-learning-object-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  private isDestroyed$ = new Subject<void>();
  learningObject: LearningObject;
  revisedLearningObject: LearningObject;
  releasedLearningObject: LearningObject;
  revisedChildren: LearningObject[];
  releasedChildren: LearningObject[];
  children: LearningObject[];
  returnUrl: string;
  loggedin: boolean;
  ratings: Rating[] = [];
  learningObjectOwners: string[];
  averageRatingValue = 0;
  showAddRating = false;
  showAddResponse = false;
  errorStatus: number;
  redirectUrl: string;
  hasRevisions: boolean;
  reviewer: boolean;
  showDownloadModal = false;
  revisedVersion = false;
  openChangelogModal = false;
  loadingChangelogs: boolean;
  changelogs = [];

  learningObjectName: string;
  ariaLabel: string;

  userRating: {
    user?: User;
    number?: number;
    comment?: string;
    date?: string;
  } = {};

  loading = [];

  // This is used by the cart service to target the iframe in this component when the action-panel download function is triggered
  iframeParent = iframeParentID;

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      // hide the new rating popup when escape key is pressed
      this.showAddRating = false;
      // hide the changelog popup when the escape key is pressed
      this.openChangelogModal = false;
    }
  }

  constructor(
    private learningObjectService: LearningObjectService,
    public userService: UserService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private ratingService: RatingService,
    private toastService: ToasterService,
    private modalService: ModalService,
    private router: Router,
    private changelogService: ChangelogService,
    private notificationService: ToasterService,
    private uriRetrieverService: UriRetrieverService
  ) {
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.isDestroyed$)).subscribe(params => {
      this.learningObjectName = decodeURIComponent(params['learningObjectName']);
      this.fetchReleasedLearningObject(
        params['username'],
        this.learningObjectName,
      );
    });

    this.ariaLabel = 'view revisions';

    this.returnUrl =
      '/browse/details/' +
      this.route.snapshot.params['username'] +
      '/' +
      this.route.snapshot.params['learningObjectName'];

    this.auth.isLoggedIn.pipe(takeUntil(this.isDestroyed$)).subscribe(val => {
      this.loggedin = val;

      if (!this.loggedin) {
        this.reviewer = false;
      } else {
        this.reviewer = this.auth.hasReviewerAccess();
      }
    });
  }

  /**
   * Returns a boolean representing whether or not the children component should be displayed
   *
   * true true if:
      1) we're looking at the released version and the released object has children, or
      2) we're looking at the revised version and the revised object has children
   * @readonly
   * @memberof DetailsComponent
   */
  get showChildren() {
    return (!this.revisedVersion && this.releasedChildren.length) || (this.revisedVersion && this.revisedChildren.length);
  }

  /**
   * toggles between released and revised copies of a learning object
   * @param revised the boolean for if the revised is being viewed
   */
  viewReleased(revised: boolean) {
    this.revisedVersion = revised;
    if (this.revisedVersion === true) {
      this.learningObject = this.revisedLearningObject;
    } else {
      this.learningObject = this.releasedLearningObject;
    }
  }

  toggleDownloadModal(val?: boolean) {
    this.showDownloadModal = val;
  }

  /**
   * Fetches the released learning object to display first. If the object hasRevisions and the user has reviewer access
   * the revised copy is also fetched.
   * @param author the author of the learning object
   * @param name the name of the learning object
   */
  async fetchReleasedLearningObject(author: string, name: string) {
    this.loading.push(1);

    try {
      this.resetRatings();
      this.releasedLearningObject = await this.learningObjectService.getLearningObject(
        author,
        name
      );

      // FIXME: This filter should be removed when service logic is updated
      this.releasedChildren = this.releasedLearningObject.children.filter(
        child => {
          return child.status === LearningObject.Status['RELEASED'] ||
            child.status === LearningObject.Status['REVIEW'] ||
            child.status === LearningObject.Status['PROOFING'] ||
            child.status === LearningObject.Status['WAITING'];
        }
      );

      const owners = this.releasedLearningObject.contributors.map(user => user.username);
      owners.push(this.releasedLearningObject.author.username);

      this.learningObjectOwners = owners;
      this.hasRevisions = this.releasedLearningObject.hasRevision;
      this.learningObject = this.releasedLearningObject;
      await this.getLearningObjectRatings();
      this.loading.pop();
    } catch (e) {

      /**
       * TODO: change status to 404 when issue #149 is closed
       * if server error is thrown, navigate to not-found page
       */

      if (e instanceof HttpErrorResponse) {
        if (e.status === 404) {
          this.router.navigate(['not-found']);
        }
        if (e.status === 401) {
          let redirectUrl = '';
          this.route.url.subscribe(segments => {
            if (segments) {
              segments.forEach(segment => {
                redirectUrl = redirectUrl + '/' + segment.path;
              });
            }
          });
          this.errorStatus = e.status;
          this.redirectUrl = redirectUrl;
        }
      }
      this.loading.pop();
      console.log(e);
    }

    if (this.hasRevisions) {
      this.loadRevisedLearningObject();
    } else {
      this.revisedLearningObject = this.learningObject;
    }
  }
  /**
   * Loaded a revised copy of the learning object if the hasRevisions flag is true
   */
  async loadRevisedLearningObject() {
    this.loading.push(1);
    try {
      this.resetRatings();
      this.revisedLearningObject = await this.learningObjectService.getRevisedLearningObject(
        this.learningObject.id
      );
      // FIXME: This filter should be removed when service logic is updated
      this.revisedChildren = this.revisedLearningObject.children.filter(
        child => {
          return child.status === LearningObject.Status['RELEASED'] ||
            child.status === LearningObject.Status['REVIEW'] ||
            child.status === LearningObject.Status['PROOFING'] ||
            child.status === LearningObject.Status['WAITING'];
        }
      );

      const owners = this.revisedLearningObject.contributors.map(user => user.username);
      owners.push(this.revisedLearningObject.author.username);

      this.learningObjectOwners = owners;
      this.loading.pop();
    } catch (e) {

      /**
      * TODO: change status to 404 when issue #149 is closed
      * if server error is thrown, navigate to not-found page
      */

      if (e instanceof HttpErrorResponse) {
        if (e.status === 404) {
          this.router.navigate(['not-found']);
        }
        if (e.status === 401) {
          let redirectUrl = '';
          this.route.url.subscribe(segments => {
            if (segments) {
              segments.forEach(segment => {
                redirectUrl = redirectUrl + '/' + segment.path;
              });
            }
          });
          this.errorStatus = e.status;
          this.redirectUrl = redirectUrl;
        }
      }
      console.log(e);
      this.loading.pop();
    }
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }

  /**
   * Closes any open change log modals
   */
  closeChangelogsModal() {
    this.openChangelogModal = false;
    this.changelogs = undefined;
  }

  /**
   * Determines if a rating is being created or edited and calls appropriate function
   * @param rating the rating object to be created
   */
  handleRatingSubmission(rating: {
    value: number;
    comment: string;
    editing?: boolean;
    id?: string;
  }) {
    if (!rating.editing) {
      // creating
      delete rating.editing;
      this.createRating(rating);
    } else {
      // editing
      delete rating.editing;
      this.updateRating(rating);
    }
  }

  /**
   * Opens the Change Log modal for a specified learning object and fetches its change logs
   */
  async openViewAllChangelogsModal() {
    if (!this.openChangelogModal) {
      this.openChangelogModal = true;
      this.loadingChangelogs = true;
      try {
        if (this.revisedVersion) {
          this.changelogs = await this.changelogService.fetchAllChangelogs({
            userId: this.learningObject.author.id,
            learningObjectId: this.learningObject.id,
            minusRevision: false,
          });
        } else {
          this.changelogs = await this.changelogService.fetchAllChangelogs({
            userId: this.learningObject.author.id,
            learningObjectId: this.learningObject.id,
            minusRevision: true,
          });
        }
      } catch (error) {
        let errorMessage;

        if (error.status === 401) {
          // user isn't logged-in, set client's state to logged-out and reload so that the route guards can redirect to login page
          this.auth.logout();
        } else {
          errorMessage = `We encountered an error while attempting to
          retrieve change logs for this Learning Object. Please try again later.`;
        }
        this.notificationService.notify('Error!', errorMessage, 'bad', 'far fa-times');
      }
      this.loadingChangelogs = false;
    }
  }

  /**
   * Creates a new rating
   * @param rating the rating to be created
   */
  createRating(rating: { value: number; comment: string; id?: string }) {
    this.ratingService
      .createRating({
        learningObjectId: this.learningObject.id,
        rating,
      })
      .then(
        () => {
          this.getLearningObjectRatings();
          this.showAddRating = false;
          this.toastService.notify(
            'Success!',
            'Review submitted successfully!',
            'good',
            'far fa-check'
          );
        },
        error => {
          this.showAddRating = false;
          this.toastService.notify(
            'Error!',
            'An error occured and your rating could not be submitted',
            'bad',
            'far fa-times'
          );
        }
      );
  }

  /**
   * Edits an existing rating. An id must be supplied.
   * @param rating the rating object to be updated
   */
  updateRating(rating: { value: number; comment: string; id?: string }) {
    const {id, ...updates} = rating;
    if (!rating.id) {
      this.toastService.notify(
        'Error!',
        'An error occured and your rating could not be updated',
        'bad',
        'far fa-times'
      );
      console.error('Error: rating id not set');
      return;
    }
    this.ratingService
      .editRating({
        learningObjectId: this.learningObject.id,
        ratingId: rating.id,
        rating: updates,
      })
      .then(
        () => {
          this.getLearningObjectRatings();
          this.showAddRating = false;
          this.toastService.notify(
            'Success!',
            'Review updated successfully!',
            'good',
            'far fa-check'
          );
        },
        error => {
          this.showAddRating = false;
          this.toastService.notify(
            'Error!',
            'An error occured and your rating could not be updated',
            'bad',
            'far fa-times'
          );
          console.error(error);
        }
      );
  }

  /**
   * Delets a user's rating (user's can only delete their own ratings)
   * @param index the index in the array of ratings that represents the rating to be deleted
   */
  async deleteRating(index) {
    // 'index' here is the index in the ratings array to delete
    const shouldDelete = await this.modalService
      .makeDialogMenu(
        'ratingDelete',
        'Are you sure you want to delete this rating?',
        'You cannot undo this action!',
        false,
        'title-bad',
        'center',
        [
          new ModalListElement('Yup, do it!', 'delete', 'bad'),
          new ModalListElement('No wait!', 'cancel', 'neutral')
        ]
      )
      .toPromise();

    if (shouldDelete === 'delete') {
      this.ratingService
        .deleteRating({
          learningObjectId: this.ratings[index].source,
          ratingId: this.ratings[index].id,
        })
        .then(val => {
          this.getLearningObjectRatings();
          this.toastService.notify(
            'Success!',
            'Rating deleted successfully!.',
            'good',
            'far fa-times'
          );
        })
        .catch(() => {
          this.toastService.notify(
            'Error!',
            'Rating couldn\'t be deleted',
            'bad',
            'far fa-times'
          );
        });
    }
  }

  /**
   * Submits a report for a rating. Report.index is a number representing the index in the list of ratings where the target rating is stored
   * @param report the report to be submitted
   */
  reportRating(report: { concern: string; index: number; comment?: string }) {
    // locate target rating and then delete the index param from the report
    const ratingId = this.ratings[report.index].id;
    delete report.index;

    if (ratingId) {
      this.ratingService
        .flagLearningObjectRating({
          learningObjectId: this.learningObject.id,
          ratingId,
          report
        })
        .catch(response => {
          if (response.status === 200) {
            this.toastService.notify(
              'Success!',
              'Report submitted successfully!',
              'good',
              'far fa-check'
            );
          } else {
            this.toastService.notify(
              'Error!',
              'An error occured and your report could not be submitted',
              'bad',
              'far fa-times'
            );
          }
        });
    } else {
      this.toastService.notify(
        'Error!',
        'An error occured and your report could not be submitted',
        'bad',
        'far fa-times'
      );
    }
  }

  /**
   * Submit new rating response
   *
   * @param {string} comment
   * @param {number} index
   */
  async submitResponse(response: {
    comment: string,
    index: number
  }) {
    // locate target rating and then delete the index param from the response
    const ratingId = this.ratings[response.index].id;
    delete response.index;

    if (ratingId) {
      const result = await this.ratingService
        .createResponse({
          learningObjectId: this.learningObject.id,
          ratingId,
          response,
        });
      if (result) {
        this.getLearningObjectRatings();
        this.toastService.notify(
          'Success!',
          'Response submitted successfully!',
          'good',
          'far fa-check'
        );
      } else {
        this.toastService.notify(
          'Error!',
          'An error occured and your response could not be submitted',
          'bad',
          'far fa-times'
        );
      }
    } else {
      this.toastService.notify(
        'Error!',
        'An error occured and your response could not be submitted',
        'bad',
        'far fa-times'
      );
    }
  }

  /**
   * Edit an existing rating response
   *
   * @param {string} comment
   * @param {number} index
   */
  async editResponse(response: {
    comment: string,
    index: number,
  }) {
    // locate target rating and then delete the index param from the response
    const ratingId = this.ratings[response.index].id;
    const responseId = this.ratings[response.index].response[0]._id;

    if (ratingId) {
      const result = await this.ratingService
        .editResponse({
          learningObjectId: this.learningObject.id,
          ratingId,
          responseId,
          updates: response,
        });
      if (result) {
        this.getLearningObjectRatings();
        this.toastService.notify(
          'Success!',
          'Response updated successfully!',
          'good',
          'far fa-check'
        );
      } else {
        this.toastService.notify(
          'Error!',
          'An error occured and your response could not be updated',
          'bad',
          'far fa-times'
        );
      }
    } else {
      this.toastService.notify(
        'Error!',
        'An error occured and your response could not be updated',
        'bad',
        'far fa-times'
      );
    }
  }

  /**
   * Delete a rating response
   *
   * @param {number} index
   */
  async deleteResponse(index: number) {
    // locate target rating and then delete the index param from the response
    const ratingId = this.ratings[index].id;
    const responseId = this.ratings[index].response[0]._id;

    const shouldDelete = await this.modalService
      .makeDialogMenu(
        'ratingDelete',
        'Are you sure you want to delete this response?',
        'You cannot undo this action!',
        false,
        'title-bad',
        'center',
        [
          new ModalListElement('Yup, do it!', 'delete', 'bad'),
          new ModalListElement('No wait!', 'cancel', 'neutral')
        ]
      )
      .toPromise();

    if (shouldDelete === 'delete') {
      if (ratingId) {
        const result = await this.ratingService
          .deleteResponse({
            learningObjectId: this.learningObject.id,
            ratingId,
            responseId,
          });

        if (result) {
          this.getLearningObjectRatings();
          this.toastService.notify(
            'Success!',
            'Response deleted successfully!',
            'good',
            'far fa-check'
          );
        } else {
          this.toastService.notify(
            'Error!',
            'An error occured and your response could not be deleted',
            'bad',
            'far fa-times'
          );
        }
      } else {
        this.toastService.notify(
          'Error!',
          'An error occured and your response could not be deleted',
          'bad',
          'far fa-times'
        );
      }
    }
  }

  /**
   * Retrieves list of learning object ratings from the RatingService.
   * If the user has a review in that list, it is assigned to the userReview variable.
   * If the service does not return any ratings, the UI resets to default rating values.
   */
  private async getLearningObjectRatings() {
    this.ratingService
      .getLearningObjectRatings({
        learningObjectId: this.learningObject.id
      })
      .then(val => {
        if (!val) {
          this.resetRatings();
          return;
        }
        this.ratings = val.ratings;
        this.averageRatingValue = val.avgValue;

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

  /**
   * Returns a boolean whether or not the object is the owner's
   * @memberof DetailsComponent
   */
  get isOwnObject() {
    if (
      this.auth.user && this.learningObjectOwners &&
      this.learningObjectOwners.includes(this.auth.username)
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Resets rating related properties to defaults
   *
   * @private
   * @memberof DetailsComponent
   */
  private resetRatings() {
    this.ratings = [];
    this.averageRatingValue = 0;
    this.userRating = {};
  }
}
