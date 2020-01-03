import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject, User } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { LearningObjectService } from 'app/core/learning-object.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { UserService } from 'app/core/user.service';
import { RatingService } from 'app/core/rating.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { ModalListElement, ModalService } from 'app/shared/modules/modals/modal.module';
import { AuthService } from 'app/core/auth.service';
import { Rating } from '../old-details/details.component';
import { ChangelogService } from 'app/core/changelog.service';
import { trigger, transition, query, style, animate, stagger } from '@angular/animations';

@Component({
  selector: 'clark-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  animations: [
    trigger('enterDetails', [
      transition(':enter', [
        query('[shouldanimate]', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger(100, [
            animate('200ms ease', style({ opacity: 1, transform: 'translateY(0px)' }))
          ])
        ])
      ])
    ]),
    // trigger('enterPage', [
    //   transition(':enter', [
    //     style({ opacity: 1, transform: 'translateX(-700px) rotate(0deg) scale(200)'}),
    //     animate('30000ms ease', style({ opacity: 1, transform: 'translateX(0px) rotateY(72000deg) scale(1)'})),
    //   ])
    // ])
  ]
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
    ) { }

  ngOnInit() {
    this.auth.isLoggedIn.pipe(takeUntil(this.isDestroyed$)).subscribe(val => {
      this.loggedin = val;

      if (!this.loggedin) {
        // this.reviewer = false;
      } else {
        // this.reviewer = this.auth.hasReviewerAccess();
      }
    });
    this.route.params.subscribe(({ username, learningObjectName }: { username: string, learningObjectName: string }) => {
      this.getLearningObject(username, learningObjectName);
    });
  }

  getLearningObject(username: string, cuid: string, version?: number) {
    this.loading = true;
    const params = {
      author: username,
      cuidInfo: {
        cuid: cuid,
        version: version,
      }
    };
    const resources = ['children', 'parents', 'outcomes', 'materials', 'metrics', 'ratings'];
      await this.learningObjectService.fetchLearningObjectWithResources(
        { author: 'nvisal1237', cuidInfo: { cuid }}, resources
        ).pipe(takeUntil(this.isDestroyed$)).subscribe(async (object) => {
        if (object) {
          this.learningObject = object;
          this.resetRatings();
          this.setAcademicLevels();
          this.getLearningObjectRatings();
          console.log(this.learningObject);

          this.titleService.setTitle(this.learningObject.name + '| CLARK');
        }
        this.loading = false;
      });

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
      this.openChangelogModal = true;
      this.loadingChangelogs = true;
      try {
        // if (this.revisedVersion) {
        //   this.changelogs = await this.changelogService.fetchAllChangelogs({
        //     userId: this.learningObject.author.id,
        //     learningObjectCuid: this.learningObject.cuid,
        //     minusRevision: false,
        //   });
        // } else {
          this.changelogs = await this.changelogService.fetchAllChangelogs({
            userId: this.learningObject.author.id,
            learningObjectCuid: this.learningObject.cuid,
            minusRevision: true,
          });
        // }
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
    }
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
   * Creates a new rating
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
  }

  /**
   * Edits an existing rating. An id must be supplied.
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
          username: this.learningObject.author.username,
          CUID: this.learningObject.cuid,
          version: this.learningObject.version,
          ratingId: this.ratings[index].id,
        })
        .then(val => {
          this.getLearningObjectRatings();
          this.toastService.success('Success!', 'Rating deleted successfully!.');
        })
        .catch(() => {
          this.toastService.error('Error!', 'Rating couldn\'t be deleted');
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
      for (let i = 0, l = data.ratings.length; i < l; i++) {
        if (u === data.ratings[i].user.username) {
          // this is the user's rating
          // we deep copy this to prevent direct modification from component subtree
          this.userRating = Object.assign({}, data.ratings[i]);
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

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
