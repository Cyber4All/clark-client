import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { LearningObjectService as LOUri} from 'app/core/learning-object.service';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * EditorialActionPadComponent coordinates all editor functionality inside of the
 * action panel. This handles conditionally rendering the relevant buttons for the
 * state of the Learning Object.
 */
@Component({
  selector: 'clark-editorial-action-pad',
  templateUrl: './editorial-action-pad.component.html',
  styleUrls: ['./editorial-action-pad.component.scss']
})
export class EditorialActionPadComponent implements OnInit {

  @Input() hasRevision: boolean;
  @Input() learningObject: LearningObject;
  openRevisionModal: boolean;
  showPopup = false;
  revision: LearningObject;

  constructor(
    private router: Router,
    private learningObjectService: LearningObjectService,
    private learningObjectServiceUri: LOUri,
    ) { }

  async ngOnInit() {
    if (this.learningObject.revisionUri) {
      this.revision = (await this.learningObjectServiceUri.fetchUri(this.learningObject.revisionUri).toPromise())[0];
    } else {
      this.revision = this.learningObject;
    }
  }

  // Determines if an editor can create a revision of a learning object
  get makeRevision() {
    return this.learningObject.status === 'released' && !this.hasRevision;
  }

  // Determines if an editor can make edits to a waiting, review, or proofing learning object
  get makeEdits() {
  return (this.learningObject.status === 'waiting' || (this.revision && this.revision.status === 'waiting')) ||
         (this.learningObject.status === 'review' || (this.revision && this.revision.status === 'review')) ||
         (this.learningObject.status === 'proofing' || (this.revision && this.revision.status === 'proofing')) ||
         (this.revision && this.revision.status === 'unreleased');
  }

  // Determines if an editor is not permitted to create a revision or make edits
  get notPermitted() {
    return (this.learningObject.status === 'released' &&
    (this.revision && (this.revision.status === 'unreleased' || this.revision.status === 'rejected'))) ||
    (this.learningObject.status === 'unreleased' || this.learningObject.status === 'rejected');
  }

  // Handles opening the create revision modal
  openCreateRevisionModal() {
    if (!this.openRevisionModal) {
      this.openRevisionModal = true;
    }
  }

  // Handles closing the create revision modal
  closeRevisionModal() {
    this.openRevisionModal = false;
  }

  // Redirects the editor to the builder to make edits to a waiting, review, or proofing object
  editLearningObject() {
    this.router.navigate([`/admin/learning-object-builder/${this.learningObject.id}`]);
  }

  // Create a revision and then redirects to the builder for the revision˝
  async createRevision() {
    const revisionUri: any = await this.learningObjectService
      .createRevision(this.learningObject.cuid, this.learningObject.author.username);
    this.revision = (await this.learningObjectServiceUri.fetchUri(revisionUri.revisionUri).toPromise())[0];
    this.router.navigate([`/onion/learning-object-builder/${this.revision.id}`]);

  }
}
