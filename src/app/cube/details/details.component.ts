/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject, User } from '@entity';
import { ActivatedRoute, Router } from '@angular/router';
import { LearningObjectService } from 'app/core/learning-object.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { UserService } from 'app/core/user.service';
import { RatingService } from 'app/core/rating.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { ModalListElement, ModalService } from 'app/shared/modules/modals/modal.module';
import { AuthService } from 'app/core/auth.service';
import { ChangelogService } from 'app/core/changelog.service';
import { trigger, transition, query, style, animate, stagger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';

export interface Rating {
  id?: string;
  user: User;
  value: number;
  comment: string;
  date: number;
  source?: {
    cuid: string,
    version: number,
  };
  response?: object;
}
@Component({
  selector: 'clark-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  learningObject: LearningObject;
  private isDestroyed$ = new Subject<void>();

  // flags
  loading: boolean;

  academicLevelMetadata = [
    {
      category: 'K-12',
      academicLevels: {
        elementary: false,
        middle: false,
        high: false,
      },
    },
    {
      category: 'College',
      academicLevels: {
        undergraduate: false,
        graduate: false,
        'post graduate': false,
      },
    },
    {
      category: 'Corporate',
      academicLevels: {
        training: false,
      },
    }
  ];

  loggedin: boolean;
  learningObjectOwners: string[];
  averageRatingValue = 0;
  showAddRating = false;
  showAddResponse = false;
  ratings: Rating[] = [];
  userRating: {
    user?: User;
    number?: number;
    comment?: string;
    date?: string;
  } = {};

  openChangelogModal = false;
  loadingChangelogs: boolean;
  changelogs = [];

  reviewer: boolean;
  revisedLearningObject: LearningObject;
  revisedVersion = false;
  releasedLearningObject: LearningObject;
  hasRevision: boolean;
  version: number;
  revisedChildren: LearningObject[];
  releasedChildren: LearningObject[];
  errorStatus: number;
  redirectUrl: string;

  authors: User[] = [];

  canAddNewRating = true;

  link: string;

  constructor(
    private route: ActivatedRoute,
    private learningObjectService: LearningObjectService,
    private titleService: Title,
    private userService: UserService,
    private ratingService: RatingService,
    private toastService: ToastrOvenService,
    public modalService: ModalService,
    private auth: AuthService,
    private changelogService: ChangelogService,
    private router: Router,
    ) { }

  ngOnInit() {
    this.authors = [];
    this.auth.isLoggedIn.pipe(takeUntil(this.isDestroyed$)).subscribe(val => {
      this.loggedin = val;

      if (!this.loggedin) {
        this.reviewer = false;
      } else {
        this.reviewer = this.auth.hasReviewerAccess();
      }
    });
    this.route.params.subscribe(({ username, learningObjectName }: { username: string, learningObjectName: string }) => {
      this.fetchReleasedLearningObject(username, learningObjectName);
    });
  }

  /**
   * Fetches the released learning object to display first. If the object hasRevisions and the user has reviewer access
   * the revised copy is also fetched.
   *
   * @param author the author of the learning object
   * @param name the name of the learning object
   */
  async fetchReleasedLearningObject(author: string, cuid: string) {
    this.loading = true;

    try {
      this.resetRatings();
      this.resetAuthors();

      const resources = ['children', 'parents', 'outcomes', 'materials', 'metrics', 'ratings'];
      await this.learningObjectService.fetchLearningObjectWithResources(
        { author, cuidInfo: { cuid }}, resources
        ).pipe(takeUntil(this.isDestroyed$)).subscribe(async (object) => {
        if (object instanceof LearningObject) {
          this.releasedLearningObject = object;

          // FIXME: This filter should be removed when service logic for filtering children is updated
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
          // this.hasRevision = !!this.releasedLearningObject.revisionUri;
          this.learningObject = this.releasedLearningObject;
          // Set page title
          this.titleService.setTitle(this.learningObject.name + '| CLARK');
          this.version = this.learningObject.version + 1;
          await this.getLearningObjectRatings();
          this.setAcademicLevels();
          this.setLearningObjectAuthors();
          this.loading = false;
          if (
            this.learningObject.collection === 'ncyte' ||
            this.learningObject.collection === 'nice'
          ) {
            this.link = '/collections/' + this.learningObject.collection;
          } else {
            this.link = '/c/' + this.learningObject.collection;
          }

          if (this.learningObject.revisionUri) {
            this.hasRevision = true;
            await this.loadRevisedLearningObject();
          }
        } else {
          if (object instanceof HttpErrorResponse) {
            if (object.status === 404) {
              this.router.navigate(['not-found']);
            }
            if (object.status === 401 || object.status === 403) {
              this.redirectUrl = window.location.href;
              this.router.navigate(['unauthorized', object.status, this.redirectUrl ]);
            }
          }
        }
      });
      // this.loading.pop();
    } catch (e) {

      /**
       * TODO: change status to 404 when issue #149 is closed
       * if server error is thrown, navigate to not-found page
       */

      console.log(e);
    }
  }

  /**
   * Returns a boolean representing whether or not the children component should be displayed
   *
   * true true if:
      1) we're looking at the released version and the released object has children, or
      2) we're looking at the revised version and the revised object has children
   *
   * @readonly
   * @memberof DetailsComponent
   */
  get showChildren() {
    return (
      !this.revisedVersion &&
      this.releasedChildren &&
      this.releasedChildren.length)
      ||
      (
      this.revisedVersion &&
      this.revisedChildren &&
      this.revisedChildren.length);
  }


  /**
   * toggles between released and revised copies of a learning object
   *
   * @param revised the boolean for if the revised is being viewed
   */
  async viewReleased(revised: boolean) {
    this.revisedVersion = revised;

    if (this.revisedVersion) {
      // await this.loadRevisedLearningObject();
      this.learningObject = this.revisedLearningObject;
    } else {
      this.learningObject = this.releasedLearningObject;
    }
  }

  /**
   * Loaded a revised copy of the learning object if the hasRevisions flag is true
   */
  async loadRevisedLearningObject() {
    // this.loading.push(1);
    try {
      this.resetRatings();
      this.revisedLearningObject = await this.learningObjectService.fetchUri(this.learningObject.revisionUri, ([ o ]) => {
        return new LearningObject(o);
      }).toPromise();

      this.learningObjectService.fetchLearningObjectResources(
        this.revisedLearningObject,
        ['children', 'parents', 'outcomes', 'materials', 'ratings']
      ).subscribe(val => {
        this.revisedLearningObject[val.name] = val.data;
      });
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
      // this.loading.pop();
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
      // this.loading.pop();
    }
  }

  setLearningObjectAuthors() {
    this.learningObject.contributors.forEach(contributor => {
      this.authors.push(contributor);
    });
  }

  resetAuthors() {
    this.authors = [];
  }

  setAcademicLevels() {
    this.learningObject.levels.forEach(level => {
      this.academicLevelMetadata.forEach(data => {
        if (data.academicLevels[level] === false) {
          data.academicLevels[level] = true;
        }
      });
    });
  }

  getGravatar(user: User) {
    return this.userService.getGravatarImage(
      user.email,
      200,
    );
  }

  /**
   * Closes any open change log modals
   */
  closeChangelogsModal() {
    this.openChangelogModal = false;
    this.changelogs = undefined;
  }

  /**
   * Opens the Change Log modal for a specified learning object and fetches its change logs
   */
  async openViewAllChangelogsModal() {
    if (!this.openChangelogModal) {
      this.loadingChangelogs = true;
      try {
        if (this.revisedVersion) {
          this.changelogs = await this.changelogService.fetchAllChangelogs({
            userId: this.learningObject.author.id,
            learningObjectCuid: this.learningObject.cuid,
            minusRevision: false,
          });
        } else {
          this.changelogs = await this.changelogService.fetchAllChangelogs({
            userId: this.learningObject.author.id,
            learningObjectCuid: this.learningObject.cuid,
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
        this.toastService.error('Error!', errorMessage);
      }
      this.loadingChangelogs = false;
      this.openChangelogModal = true;
    }
  }

  /**
   * Determines if a rating is being created or edited and calls appropriate function
   *
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
    * Creates a new rating
    *
    * @param rating the rating to be created
    */
  createRating(rating: { value: number; comment: string; id?: string }) {
    this.ratingService
      .createRating({
        username: this.learningObject.author.username,
        CUID: this.learningObject.cuid,
        version: this.learningObject.version,
        rating,
      })
      .then(
        () => {
          this.getLearningObjectRatings();
          this.showAddRating = false;
          this.toastService.success('Success!', 'Review submitted successfully!');
        },
        error => {
          this.showAddRating = false;
          this.toastService.error('Error!', 'An error occurred and your rating could not be submitted');
        }
      );
      this.canAddNewRating = false;
  }

  /**
   * Edits an existing rating. An id must be supplied.
   *
   * @param rating the rating object to be updated
   */
  updateRating(rating: { value: number; comment: string; id?: string }) {
    const {id, ...updates} = rating;
    if (!rating.id) {
      this.toastService.error('Error!', 'An error occured and your rating could not be updated');
      console.error('Error: rating id not set');
      return;
    }
    this.ratingService
      .editRating({
        username: this.learningObject.author.username,
        CUID: this.learningObject.cuid,
        version: this.learningObject.version,
        ratingId: rating.id,
        rating: updates,
      })
      .then(
        () => {
          this.getLearningObjectRatings();
          this.showAddRating = false;
          this.toastService.success('Success!', 'Review updated successfully!');
        },
        error => {
          this.showAddRating = false;
          this.toastService.error('Error!', 'An error occurred and your rating could not be updated');
          console.error(error);
        }
      );
  }

  /**
   * Delets a user's rating (user's can only delete their own ratings)
   *
   * @param index the index in the array of ratings that represents the rating to be deleted
   */
  async deleteRating(index) {
    // 'index' here is the index in the ratings array to delete
    this.ratingService
      .deleteRating({
        username: this.learningObject.author.username,
        CUID: this.learningObject.cuid,
        version: this.learningObject.version,
        ratingId: this.ratings[index].id,
      })
      .then(val => {
        this.getLearningObjectRatings();
        this.toastService.success('Success!', 'Rating deleted successfully!');
      })
      .catch(() => {
        this.toastService.error('Error!', 'Rating couldn\'t be deleted');
      });
    // Set the user Rating to empty so that if they choose enter a new ratings their old one isn't there
    this.userRating = {};
    this.canAddNewRating = true;
  }

  /**
   * Submits a report for a rating. Report.index is a number representing the index in the list of ratings where the target rating is stored
   *
   * @param report the report to be submitted
   */
  reportRating(report: { concern: string; index: number; comment?: string }) {
    // locate target rating and then delete the index param from the report
    const ratingId = this.ratings[report.index].id;
    delete report.index;

    if (ratingId) {
      this.ratingService
        .flagLearningObjectRating({
          username: this.learningObject.author.username,
          CUID: this.learningObject.cuid,
          version: this.learningObject.version,
          ratingId,
          report
        })
        .catch(response => {
          if (response.status === 200) {
            this.toastService.success('Success!', 'Report submitted successfully!');
          } else {
            this.toastService.error('Error!', 'An error occured and your report could not be submitted');
          }
        });
    } else {
      this.toastService.error('Error!', 'An error occured and your report could not be submitted');
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
          username: this.learningObject.author.username,
          CUID: this.learningObject.cuid,
          version: this.learningObject.version,
          ratingId,
          response,
        });
      if (result) {
        this.getLearningObjectRatings();
        this.toastService.success('Success!', 'Response submitted successfully!');
      } else {
        this.toastService.error('Error!', 'An error occurred and your response could not be submitted');
      }
    } else {
      this.toastService.error('Error!', 'An error occurred and your response could not be submitted');
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
    const ratingId = this.learningObject.ratings[response.index].id;
    const responseId = this.ratings[response.index].response[0]._id;

    if (ratingId) {
      const result = await this.ratingService
        .editResponse({
          username: this.learningObject.author.username,
          CUID: this.learningObject.cuid,
          version: this.learningObject.version,
          ratingId,
          responseId,
          updates: response,
        });
      if (result) {
        this.getLearningObjectRatings();
        this.toastService.success('Success!', 'Response updated successfully!');
      } else {
        this.toastService.error('Error!', 'An error occurred and your response could not be updated');
      }
    } else {
      this.toastService.error('Error!', 'An error occurred and your response could not be updated');
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
            username: this.learningObject.author.username,
            CUID: this.learningObject.cuid,
            version: this.learningObject.version,
            ratingId,
            responseId,
          });

        if (result) {
          this.getLearningObjectRatings();
          this.toastService.success('Success!', 'Response deleted successfully!');
        } else {
          this.toastService.error('Error!', 'An error occured and your response could not be deleted');
        }
      } else {
        this.toastService.error('Error!', 'An error occured and your response could not be deleted');
      }
    }
  }

  /**
   * Retrieves list of learning object ratings from the RatingService.
   * If the user has a review in that list, it is assigned to the userReview variable.
   * If the service does not return any ratings, the UI resets to default rating values.
   */
  private async getLearningObjectRatings() {
    this.learningObjectService.fetchLearningObjectResources(this.learningObject, ['ratings']).toPromise().then(({ name, data }) => {

      if (!data) {
        this.resetRatings();
        return;
      }

      this.ratings = data.ratings;
      this.averageRatingValue = data.avgValue;

      const u = this.auth.username;
      if (this.ratings && this.ratings.length) {
        for (let i = 0, l = this.ratings.length; i < l; i++) {
          if (u === data.ratings[i].user.username) {
            // this is the user's rating
            // we deep copy this to prevent direct modification from component subtree
            this.userRating = Object.assign({}, data.ratings[i]);
            // See if the user can add new rating or will have the option to edit their current rating
            if (this.userRating) {
              this.canAddNewRating = false;
            }
            return;
          }
        }
      }
      // if we found the rating, we've returned from the function at this point
      this.userRating = {};
    });
  }

  /**
   * Returns a boolean whether or not the object is the owner's
   *
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

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
