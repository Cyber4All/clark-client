import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Collection, LearningObject, LearningOutcome } from '@entity';
import { ChangelogService } from 'app/core/learning-object-module/changelog/changelog.service';
import { Subject } from 'rxjs';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { first } from 'rxjs/operators';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { AuthService } from 'app/core/auth-module/auth.service';
import { HierarchyService } from 'app/core/learning-object-module/hierarchy/hierarchy.service';
import { CHANGE_AUTHORIZATION_LIST } from '../../../../environments/strings';
import { Router } from '@angular/router';
import { SubmissionsService } from 'app/core/learning-object-module/submissions/submissions.service';

@Component({
  selector: 'clark-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponent implements OnInit {
  @Input() collection?: string;
  @Input() learningObject: LearningObject;
  @Input() learningOutcomes: Map<string, Partial<LearningOutcome>>;
  @Input() isHierarchySubmission = false;
  @Input() visible: boolean;

  @Output() submitted: EventEmitter<void> = new EventEmitter();

  carouselAction$: Subject<number> = new Subject();
  changelogComplete$: Subject<boolean> = new Subject();

  changelog: string;
  licenseAccepted: boolean;
  submissionReminder: boolean;
  needsChangelog: boolean;

  loading: boolean[] = [];
  submissionReason: string;
  selectedAuthorizations: string[] = [];
  changeAuthorizationList = CHANGE_AUTHORIZATION_LIST;
  collections: Collection[];

  @Output() close: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private changelogService: ChangelogService,
    private collectionService: CollectionService,
    private learningObjectService: LearningObjectService,
    private submissionService: SubmissionsService,
    private hierarchyService: HierarchyService,
    private toasterService: ToastrOvenService,
    private auth: AuthService,
    private router: Router,
  ) { }

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

    this.selectedAuthorizations = this.changeAuthorizationList.map(
      (authorization) => authorization.permission
    );
    this.setCollections();
  }

  /**
   * Create a new changelog for the active Learning Object
   */
  createChangelog() {

    if (this.changelog) {
      console.log(this.changelog);
      this.loading.push(true);
      this.changelogService
        .createChangelog(
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
      (this.learningObject.outcomes.length !== 0 ||
        this.learningOutcomes.size !== 0) &&
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
    if (this.learningObject.name === '') {
      str += potentialErrorFields['name'];
    }
    if (this.learningObject.description === '') {
      str += (str === '') ? potentialErrorFields['description'] : ',' + potentialErrorFields['description'];
    }
    if (this.learningObject.outcomes.length === 0) {
      str += (str === '') ? potentialErrorFields['outcome'] : ',' + potentialErrorFields['outcome'];
    }
    if (this.learningObject.contributors.length === 0) {
      str += (str === '') ? potentialErrorFields['contributor'] : ',' + potentialErrorFields['contributor'];
    }
    return str;
  }

  /**
   * Submits a Learning Object to a collection for review and publishes the object
   */
  async submitForReview() {
    let proceed = true;

    if (this.needsChangelog) {
      this.advance();
      proceed = await this.changelogComplete$.pipe(first()).toPromise();
    }

    if (!this.isValidLearningObject()) {
      proceed = false;
      const missingFields = this.buildUnfinishedLOErrorMsg();
      this.toasterService.error(
        'Incomplete Learning Object!',
        `Please provide the following fields to submit: ${missingFields}.`
      );
    }

    if (proceed) {
      this.loading.push(true);
      if (this.isHierarchySubmission) {
        this.hierarchyService.submitHierarchy(this.learningObject._id, this.collection)
          .then(() => {
            this.closeModal(true);
            this.loading.pop();
            location.reload(); // Reload the page so that the entire hierarchy's icon change
            return true;
          }).catch((e) => {
            if (e.status === 401) {
              // user isn't logged in, redirect to login page
              this.auth.logout();
            } else if (e.status === 400) {
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
      } else {
        this.submissionService
          .submit({
            learningObjectId: this.learningObject._id,
            collectionName: this.collection,
            submissionReason: this.submissionReason,
            selectedAuthorizations: this.selectedAuthorizations,
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
            this.router.navigate(['onion/dashboard']);
            return true;
          })
          .catch(e => {
            if (e.status === 401) {
              // user isn't logged in, redirect to login page
              this.auth.logout();
            } else if (e.status === 400) {
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
  }

  /**
   * Gets the collection name selected from the output
   *
   * @param collection The selected collection
   */
  getCollectionSelected(collection: string) {
    this.submissionService.getFirstSubmission(this.learningObject._id, collection)
      .then(val => {
        this.collection = collection;
        if (!val.isFirstSubmission) {
          // if this is a first submission there is no need for a change log
          this.needsChangelog = false;
          console.log(val.isFirstSubmission);
        }
      });
  }

  /**
   * Emit a close event to parent component
   *
   * @memberof SubmitComponent
   */
  closeModal(submitted?: boolean) {
    this.submissionReason = undefined;
    if (this.visible) {
      this.close.emit(submitted || false);
      this.visible = false;
    }
  }

  /**
   * Sets submission reason
   *
   * @param event the event that triggered the method
   */
  setSubmissionReason(event: any) {
    // strip \n from submission reason
    event = event.replace(/\n/g, '');
    this.submissionReason = event;
  }

  /**
   * Adds the selected authorization to the list of selected options
   *
   * @param val the value of the selected option
   */
  selectChangesOption(val: string) {
    this.selectedAuthorizations.push(val);
  }

  /**
   * Removes the selected authorization from the list of selected options
   *
   * @param val the value of the selected option
   */
  deselectChangesOption(val: string) {
    this.selectedAuthorizations.splice(
      this.selectedAuthorizations.indexOf(val),
      1
    );
  }

  /**
   * Checks if the selected option is in the list of selected options
   *
   * @param val the value of the selected option
   * @returns true if the selected option is in the list of selected options
   */
  isSelectedAuthorization(val: string): boolean {
    return this.selectedAuthorizations.includes(val);
  }

  /**
   * Sets the list of collections
   */
  async setCollections() {
    this.collections = (await this.collectionService.getCollections()).filter(collection => collection.abvName !== 'nccp');
  }
}
