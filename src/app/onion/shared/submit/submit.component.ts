import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LearningObject } from '@entity';
import { ChangelogService } from 'app/core/changelog.service';
import { Subject } from 'rxjs';
import { CollectionService } from 'app/core/collection.service';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { first } from 'rxjs/operators';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponent implements OnInit {
  @Input() collection?: string;
  @Input() learningObject: LearningObject;

  @Input() visible: boolean;

  @Output() submitted: EventEmitter<void> = new EventEmitter();

  carouselAction$: Subject<number> = new Subject();
  changelogComplete$: Subject<boolean> = new Subject();

  changelog: string;
  licenseAccepted: boolean;
  submissionReminder: boolean;
  needsChangelog: boolean;

  loading: boolean[] = [];

  @Output() close: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private changelogService: ChangelogService,
    private collectionService: CollectionService,
    private learningObjectService: LearningObjectService,
    private toasterService: ToastrOvenService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    if (this.learningObject.collection && !this.collection) {
      this.collection = this.learningObject.collection;

      if (this.learningObject.version > 0) {
        // if this is a revision, there was obviously something changed and a changelog is appropriate
        this.needsChangelog = true;
      } else {
        this.getCollectionSelected(this.collection);
      }

    }
  }

  /**
   * Create a new changelog for the active Learning Object
   */
  createChangelog() {
    if (this.changelog) {
      this.loading.push(true);
      this.changelogService
        .createChangelog(
          this.learningObject.author.username,
          this.learningObject.cuid,
          this.changelog
        )
        .then(() => {
          this.changelogComplete$.next(true);
          this.loading.pop();
        })
        .catch(e => {
          this.changelogComplete$.next(false);
          this.loading.pop();

          if (e.status === 401) {
            // user isn't logged in, redirect to login page
            this.auth.logout();
          } else {
            this.toasterService.error(
              'Error!',
              'We couldn\'t submit your change log at this time. Please try again later.',
            );
          }
        });
    } else {
      this.changelogComplete$.next(true);
    }
  }

  /**
   * Move the carousel forwards by {distance}
   *
   * @param {number} [distance=1] the amount of carousel slides to traverse
   * @memberof SubmitComponent
   */
  advance(distance: number = 1) {
    this.carouselAction$.next(distance);
  }

  /**
   * Move the carousel backwards by {distance}
   *
   * @param {number} [distance=1] the number of carousel slides to traverse
   * @memberof SubmitComponent
   */
  regress(distance: number = 1) {
    this.carouselAction$.next(distance * -1);
  }

  /**
   * @returns {boolean} true if the LO has a name, description, a contributor, and at least 1 outcome
   */
  isValidLearningObject(): boolean {
    return (
      this.learningObject.description !== '' &&
      this.learningObject.name !== '' &&
      this.learningObject.outcomes.length !== 0 &&
      this.learningObject.contributors.length !== 0
    );
  }

  /**
   * @returns {string} a string with missing required fields for an error message
   */
  private buildUnfinishedLOErrorMsg(): string {
    let str = '';
    const potentialErrorFields = {
      name: ' name',
      description: ' description', 
      contributor: ' contributor(s)', 
      outcome: ' outcome(s)'
    };
    if(this.learningObject.name === '') {
      str += potentialErrorFields['name'];
    }
    if(this.learningObject.description === '') {
      str += (str === '') ? potentialErrorFields['description']: ',' + potentialErrorFields['description'];
    }
    if(this.learningObject.outcomes.length === 0) {
      str += (str === '') ? potentialErrorFields["outcome"]: ',' + potentialErrorFields["outcome"];
    }
    if(this.learningObject.contributors.length === 0) {
      str += (str === '') ? potentialErrorFields["contributor"]: ',' + potentialErrorFields["contributor"];
    }
    return str;
  }

  /**
   * Checks to see if the name of the learning object is valid, meaning it does not 
   * contain any special characters
   * @returns True if the learning object name does not contain a special character
   */
  private isObjectNameValid() {
    return this.learningObject.name.match(/[\\/:"*?<>|]/) === null;
  }

  /**
   * Submits a Learning Object to a collection for review and publishes the object
   *
   * @param {string} collection the name of the collection to submit to
   */
  async submitForReview() {
    let proceed = true;

    if (this.needsChangelog) {
      this.advance();
      proceed = await this.changelogComplete$.pipe(first()).toPromise();
    }

    if(!this.isValidLearningObject()) {
      proceed = false;
      const missingFields = this.buildUnfinishedLOErrorMsg();
      this.toasterService.error(
        'Incomplete Learning Object!',
        `Please provide the following fields to submit: ${missingFields}.`
      );
    }

    // Check Learning Objects Name
    if (this.isObjectNameValid()) {
      proceed = false;
      this.toasterService.error(
        'Learning Object Cannot Be Submitted!',
        'The name of a learning object cannot contain a special character.'
      );
    }

    if (proceed) {
      this.loading.push(true);
      this.collectionService
      .submit({
        learningObjectId: this.learningObject.id,
        userId: this.learningObject.author.id,
        collectionName: this.collection
      })
      .then(() => {
        this.learningObject.status = LearningObject.Status.WAITING;
        this.learningObject.collection = this.collection;
        this.toasterService.success(
          'Success!',
          'Learning Object submitted successfully!',
        );
        this.loading.pop();
        this.closeModal(true);
        return true;
      })
      .catch(e => {
        if (e.status === 401) {
          // user isn't logged in, redirect to login page
          this.auth.logout();
        } else if (e.status === 400){
          this.toasterService.error(
            'Incomplete Learning Object!',
            'Please review your object for empty learning outcomes and ensure that there is a description, ' +
            'name, and at least 1 contributor.',
          );
        } else {
          this.toasterService.error(
            'Error!',
            `There was an error trying to submit your object at this time. Please try again later...`,
          );
        }
        this.loading.pop();
        this.closeModal();
        return false;
      });
    }
  }

  /**
   * Gets the collection name selected from the output
   *
   * @param collection The selected collection
   */
  getCollectionSelected(collection: string) {
    this.learningObjectService.getFirstSubmission(this.learningObject.author.id, this.learningObject.id, collection, true)
    .then(val => {
      this.collection = collection;
      if (!val.isFirstSubmission) {
        this.needsChangelog = true;
      }
    });
  }

  /**
   * Emit a close event to parent component
   *
   * @memberof SubmitComponent
   */
  closeModal(submitted?: boolean) {
    if (this.visible) {
      this.close.emit(submitted || false);
      this.visible = false;
    }
  }
}
