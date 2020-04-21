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
          this.learningObject.author.id,
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
   * Submits a Learning Object to a collection for review and publishes the object
   * @param {string} collection the name of the collection to submit to
   */
  async submitForReview() {
    let proceed = true;

    if (this.needsChangelog) {
      this.advance();
      proceed = await this.changelogComplete$.pipe(first()).toPromise();
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
        } else {
          this.toasterService.error(
            'Error!',
            'We couldn\'t submit your Learning Object at this time. Please try again later.',
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
