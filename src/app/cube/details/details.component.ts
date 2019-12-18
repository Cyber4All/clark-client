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

@Component({
  selector: 'clark-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
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

  constructor(
    private route: ActivatedRoute,
    private learningObjectService: LearningObjectService,
    private titleService: Title,
    private userService: UserService,
    private ratingService: RatingService,
    private toastService: ToastrOvenService,
    public modalService: ModalService,
    private auth: AuthService,
    ) { }

  ngOnInit() {
    this.auth.isLoggedIn.pipe(takeUntil(this.isDestroyed$)).subscribe(val => {
      this.loggedin = val;

      if (!this.loggedin) {
        //this.reviewer = false;
      } else {
        //this.reviewer = this.auth.hasReviewerAccess();
      }
    });
    this.route.params.subscribe(async ({ username, learningObjectName }: { username: string, learningObjectName: string }) => {
      await this.getLearningObject(username, learningObjectName);
    });
  }

  async getLearningObject(username: string, cuid: string, version?: number) {
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
        this.setAcademicLevels();
        console.log(this.learningObject);

        this.titleService.setTitle(this.learningObject.name + '| CLARK');
      }
    });
    this.loading = false;
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
