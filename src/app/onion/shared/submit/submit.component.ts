import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';
import { ChangelogService } from 'app/core/changelog.service';
import { Subject } from 'rxjs';
import { CollectionService } from 'app/core/collection.service';
import { LearningObjectService } from 'app/onion/core/learning-object.service';

@Component({
  selector: 'clark-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss']
})
export class SubmitComponent implements OnInit {
  @Input() collection?: string;
  @Input() learningObject: LearningObject;

  @Input() visible: boolean;
  @Input() error: boolean;

  carouselAction$: Subject<string> = new Subject();

  changelog: string;

  constructor(
    private changelogService: ChangelogService,
    private collectionService: CollectionService,
    private learningObjectService: LearningObjectService
  ) {}

  ngOnInit() {}

  /**
   * Create a new changelog for the active learning object
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
          this.visible = false;
        })
        .catch(e => {
          console.error(e);
          this.visible = false;
          // TODO display visible error handling to user
        });
    } else {
      this.visible = false;
    }
    this.submitForReview(this.collection);
  }

  advance(distance: number = 1) {
    this.carouselAction$.next('+' + distance);
  }

  regress(distance: number = 1) {
    this.carouselAction$.next('-' + distance);
  }

  /**
   * Submits a learning object to a collection for review and publishes the object
   * @param {string} collection the name of the collection to submit to
   */
  submitForReview(collection: string) {
    this.collectionService
      .submit({
        learningObjectId: this.learningObject.id,
        userId: this.learningObject.author.id,
        collectionName: collection
      })
      .then(() => {
        this.learningObject.status = LearningObject.Status.WAITING;
        this.learningObject.collection = collection;
        // TODO provide feedback here
        // this.toasterService.notify(
        //   'Success!',
        //   'Learning object submitted successfully!',
        //   'good',
        //   'far fa-check'
        // );
        return true;
      })
      .catch(e => {
        // this.handleServiceError(e, BUILDER_ERRORS.SUBMIT_REVIEW);
        // TODO fix this
        alert('an error occurred');
        this.visible = false;
        this.error = true;
        return false;
      });
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
        this.advance()
      } else {
        this.submitForReview(this.collection);
      }
    });
  }
}

/*
 */
