import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LearningObject } from '@entity';
import { ChangelogService } from 'app/core/changelog.service';
import { Subject } from 'rxjs';
import { CollectionService } from 'app/core/collection.service';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { first } from 'rxjs/operators';
import { ToasterService } from 'app/shared/shared modules/toaster';
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

  carouselAction$: Subject<number> = new Subject();
  changelogComplete$: Subject<boolean> = new Subject();

  changelog: string;
  licenseAccepted: boolean;
  needsChangelog: boolean;

  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(
    private changelogService: ChangelogService,
    private collectionService: CollectionService,
    private learningObjectService: LearningObjectService,
    private toasterService: ToasterService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    if (this.learningObject.collection && !this.collection) {
      this.collection = this.learningObject.collection;
      this.getCollectionSelected(this.collection);
    }
  }

  /**
   * Create a new changelog for the active Learning Object
   */
  createChangelog() {
    if (this.changelog) {
      this.changelogService
        .createChangelog(
          this.learningObject.author.id,
          this.learningObject.id,
          this.changelog
        )
        .then(() => {
          this.changelogComplete$.next(true);
        })
        .catch(e => {
          this.closeModal();
          this.changelogComplete$.next(false);

          if (e.status === 401) {
            // user isn't logged in, redirect to login page
            this.auth.logout();
          } else {
            this.toasterService.notify(
              'Error!',
              'We couldn\'t submit your change log at this time. Please try again later.',
              'bad',
              'far fa-times'
            );
          }
        });
    } else {
      this.changelogComplete$.next(true);
      this.closeModal();
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
      this.collectionService
      .submit({
        learningObjectId: this.learningObject.id,
        userId: this.learningObject.author.id,
        collectionName: this.collection
      })
      .then(() => {
        this.learningObject.status = LearningObject.Status.WAITING;
        this.learningObject.collection = this.collection;
        this.toasterService.notify(
          'Success!',
          'Learning Object submitted successfully!',
          'good',
          'far fa-check'
        );
        this.closeModal();
        return true;
      })
      .catch(e => {
        if (e.status === 401) {
          // user isn't logged in, redirect to login page
          this.auth.logout();
        } else {
          this.toasterService.notify(
            'Error!',
            'We couldn\'t submit your Learning Object at this time. Please try again later.',
            'bad',
            'far fa-times'
          );
        }
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
  closeModal() {
    this.close.emit();
  }
}
