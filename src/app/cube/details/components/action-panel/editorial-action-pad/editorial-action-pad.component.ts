import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { LearningObjectService as LOUri } from 'app/core/learning-object-module/learning-object/learning-object.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

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
  @Input() userIsAuthor: boolean;
  openRevisionModal: boolean;
  showPopup = false;

  @Input() revisedLearningObject: LearningObject;

  constructor(
    private router: Router,
    private learningObjectService: LearningObjectService,
    private learningObjectServiceUri: LOUri,
    private toaster: ToastrOvenService,
  ) { }

  async ngOnInit() {
  }

  // Determines if an editor can create a revision of a learning object
  get makeRevision() {
    return ((this.learningObject.status === 'released') && (!this.revisedLearningObject));
  }
  // Determines if an editor can make edits to a waiting, review, or proofing learning object
  get makeEdits() {
    return (this.learningObject.status === 'waiting' || (this.revisedLearningObject && this.revisedLearningObject.status === 'waiting')) ||
      (this.learningObject.status === 'review' || (this.revisedLearningObject && this.revisedLearningObject.status === 'review')) ||
      (this.learningObject.status === 'proofing' || (this.revisedLearningObject && this.revisedLearningObject.status === 'proofing')) ||
      (this.learningObject.status === 'unreleased' ||
        (this.revisedLearningObject && this.revisedLearningObject.status === 'unreleased'));
  }

  // Determines if an editor is not permitted to create a revision or make edits
  get notPermitted() {
    return (this.learningObject.status === 'released' &&
      (this.revisedLearningObject &&
        (this.revisedLearningObject.status === 'unreleased' || this.revisedLearningObject.status === 'rejected'))) ||
      (this.learningObject.status === 'rejected');
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

  // Redirects the editors and authors to the builder to make edits to a waiting, review, or proofing object
  editLearningObject() {
    const userOrAdminRoute = (this.userIsAuthor) ? 'onion' : 'admin';
    if (this.revisedLearningObject) {
      this.router.navigate([userOrAdminRoute, 'learning-object-builder', this.revisedLearningObject.id]);
    } else {
      this.router.navigate([userOrAdminRoute, 'learning-object-builder', this.learningObject.id]);
    }
  }

  // Create a revision and then redirects to the builder for the revision˝
  async createRevision() {
    this.closeRevisionModal();
    this.toaster.success('One Moment Please', 'Your revision is being created.');
    await this.learningObjectService
      .createRevision(this.learningObject.cuid, this.learningObject.author.username).then(async (revisionUri: any) => {
        this.revisedLearningObject = (await this.learningObjectServiceUri.fetchUri(revisionUri.revisionUri).toPromise())[0];
        this.router.navigate([`/onion/learning-object-builder/${this.revisedLearningObject.id}`]);
      }).catch(e => {
        this.toaster.error('Error', e.error.message);
      });
  }
}
