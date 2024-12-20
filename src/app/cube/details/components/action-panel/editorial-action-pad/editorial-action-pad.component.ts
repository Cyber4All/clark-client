import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';
import { LearningObjectService as LOUri } from 'app/core/learning-object-module/learning-object/learning-object.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { RevisionsService } from 'app/core/learning-object-module/revisions/revisions.service';

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
    private learningObjectServiceUri: LOUri,
    private toaster: ToastrOvenService,
    private revisionsService: RevisionsService,
  ) { }

  async ngOnInit() {
    // Check for the revisions
    const version = await this.learningObjectServiceUri.getLearningObject(this.learningObject.cuid, this.learningObject.version + 1);
    if(version) {
      this.hasRevision = true;
      this.revisedLearningObject = version;
    }
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
      this.router.navigate([
        'onion',
        'learning-object-builder',
        this.revisedLearningObject.cuid,
        this.revisedLearningObject.version]);
    } else {
      this.router.navigate([
        'onion',
        'learning-object-builder',
        this.learningObject.cuid,
        this.learningObject.version]);
    }
  }

  // Create a revision and then redirects to the builder for the revision˝
  async createRevision() {
    this.closeRevisionModal();
    this.toaster.success('One Moment Please', 'Your revision is being created.');
    // TODO: Update the createRevision's response to be a revised learning object rather than
    // using a GET request to make a request that would effectively do the same thing.
    // This will cut down on requests and simplify abstraction.
    await this.revisionsService
      .createRevision(this.learningObject.cuid).then(async (revisionUri: any) => {
        this.revisedLearningObject = (await this.learningObjectServiceUri.fetchUri(revisionUri.revisionUri).toPromise())[0];
        this.router.navigate([`/onion/learning-object-builder/${this.revisedLearningObject.cuid}/${this.revisedLearningObject.version}`]);
      }).catch(e => {
        this.toaster.error('Error', e.error.message);
      });
  }
}
