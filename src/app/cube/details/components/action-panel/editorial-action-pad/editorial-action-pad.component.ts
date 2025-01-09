import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';
import { LearningObjectService as LOUri } from 'app/core/learning-object-module/learning-object/learning-object.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { EditorialService } from 'app/core/learning-object-module/editorial.service';

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
    private learningObjectServiceUri: LOUri,
    private toaster: ToastrOvenService,
    private editorialService: EditorialService,
  ) { }

  async ngOnInit() {
    // Check for the revisions
    const revisionObject = await this.learningObjectServiceUri.getLearningObject(this.learningObject.cuid, this.learningObject.version + 1);
    this.hasRevision = !!revisionObject;
    this.revisedLearningObject = revisionObject;
  }

  // Determines if an editor can create a revision of a learning object
  get canCreateRevision() {
    return this.editorialService.canCreateRevision(this.learningObject, this.revisedLearningObject);
  }

  // Determines if an editor can make edits to a waiting, review, or proofing learning object
  get canMakeEdits() {
    return this.editorialService.canMakeEdits(this.learningObject, this.revisedLearningObject);
  }

  // Determines if an editor is not permitted to create a revision or make edits
  get isNotPermitted() {
    return this.editorialService.isNotPermittedToMakeChanges(this.learningObject, this.revisedLearningObject);
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
    if (this.revisedLearningObject) {
      this.editorialService.navigateToEditor(this.revisedLearningObject);
    } else {
      this.editorialService.navigateToEditor(this.learningObject);
    }
  }

  // Create a revision and then redirects to the builder for the revision˝
  async createRevision() {
    this.closeRevisionModal();
    this.toaster.success('One Moment Please', 'Your revision is being created.');
    // TODO: Update the createRevision's response to be a revised learning object rather than
    // using a GET request to make a request that would effectively do the same thing.
    // This will cut down on requests and simplify abstraction.
    await this.editorialService
      .createRevision(this.learningObject.cuid).then(async (revisionUri: any) => {
        this.revisedLearningObject = (await this.learningObjectServiceUri.fetchUri(revisionUri.revisionUri).toPromise())[0];
        this.editorialService.navigateToEditor(this.revisedLearningObject);
      }).catch(e => {
        this.toaster.error('Error', e.error.message);
      });
  }
}
