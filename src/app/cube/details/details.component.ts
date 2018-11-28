import { iframeParentID } from '../../core/cartv2.service';
import { LearningObjectService } from '../learning-object.service';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/user.service';
import { Subject } from 'rxjs/Subject';
import { AuthService } from '../../core/auth.service';
import { RatingService } from '../../core/rating.service';
import { ToasterService } from '../../shared/toaster/toaster.service';
import { ModalService, ModalListElement } from '../../shared/modals';
import { PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import { canViewInBrowser } from 'app/shared/filesystem/file-functions';
import { HttpErrorResponse } from '@angular/common/http';

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
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  private isDestroyed$ = new Subject<void>();
  learningObject: LearningObject;
  returnUrl: string;
  loggedin: boolean;
  ratings: Rating[] = [];
  averageRating = 0;
  showAddRating = false;
  isOwnObject = false;

  userRating: {
    user?: User;
    number?: number;
    comment?: string;
    date?: string;
  } = {};

  // This is used by the cart service to target the iframe in this component when the action-panel download function is triggered
  iframeParent = iframeParentID;

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      // hide the new rating popup when escape key is pressed
      this.showAddRating = false;
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
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.takeUntil(this.isDestroyed$).subscribe(params => {
      this.fetchLearningObject(
        params['username'],
        params['learningObjectName']
      );
    });

    this.returnUrl =
      '/browse/details/' +
      this.route.snapshot.params['username'] +
      '/' +
      this.route.snapshot.params['learningObjectName'];

    this.auth.isLoggedIn.takeUntil(this.isDestroyed$).subscribe(val => {
      this.loggedin = val;

      if (!this.loggedin) {
        this.isOwnObject = false;
      }
    });

  }

  async fetchLearningObject(author: string, name: string) {
    try {
      this.learningObject = await this.learningObjectService.getLearningObject(
        author,
        name
      );
      this.learningObject.materials.files = this.learningObject.materials.files.map(
        file => {
          file.url = PUBLIC_LEARNING_OBJECT_ROUTES.DOWNLOAD_FILE({
            username: this.learningObject.author.username,
            loId: this.learningObject.id,
            fileId: file.id,
            open: canViewInBrowser(file)
          });
          return file;
        }
      );

      if (
        this.auth.user &&
        this.auth.user.username === this.learningObject.author.username
      ) {
        this.isOwnObject = true;
      } else {
        this.isOwnObject = false;
      }

      this.getLearningObjectRatings();
    } catch (e) {

      /**
       * TODO: change status to 404 when issue #149 is closed
       * if server error is thrown, navigate to not-found page
       */

      if (e instanceof HttpErrorResponse) {
        if (e.status === 500) {
          this.router.navigate(['not-found']);
        }
      }
      console.log(e);
    }
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }

  /**
   * Determines if a rating is being created or edited and calls appropriate function
   * @param rating the rating object to be created
   */
  handleRatingSubmission(rating: {
    number: number;
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
  createRating(rating: { number: number; comment: string; id?: string }) {
    this.ratingService
      .createRating(
        this.learningObject.author.username,
        this.learningObject.name,
        rating as Rating
      )
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
          console.error(error);
        }
      );
  }

  /**
   * Edits an existing rating. An id must be supplied.
   * @param rating the rating object to be updated
   */
  updateRating(rating: { number: number; comment: string; id?: string }) {
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
      .editRating(
        this.learningObject.author.username,
        this.learningObject.name,
        rating.id,
        rating as Rating
      )
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
          new ModalListElement('No wait!', 'cancel', 'neutral on-white')
        ]
      )
      .toPromise();

    if (shouldDelete === 'delete') {
      this.ratingService
        .deleteRating(
          this.learningObject.author.username,
          this.learningObject.name,
          this.ratings[index].id
        )
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
            "Rating couldn't be deleted",
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
        .flagLearningObjectRating(
          this.learningObject.author.username,
          this.learningObject.name,
          ratingId,
          report
        )
        .then(
          val => {
            this.toastService.notify(
              'Success!',
              'Report submitted successfully!',
              'good',
              'far fa-check'
            );
          },
          error => {
            this.toastService.notify(
              'Error!',
              'An error occured and your report could not be submitted',
              'bad',
              'far fa-times'
            );
            console.error(error);
          }
        );
    } else {
      this.toastService.notify(
        'Error!',
        'An error occured and your report could not be submitted',
        'bad',
        'far fa-times'
      );
      console.error('No ratingId specified');
    }
  }

  /**
   * Retrieves list of learning object ratings from server and, if the user has a review in that lkist, assigns it to the
   * userReview variable
   */
  private async getLearningObjectRatings() {
    this.ratingService
      .getLearningObjectRatings(
        this.learningObject.author.username,
        this.learningObject.name
      )
      .then(val => {
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
}
