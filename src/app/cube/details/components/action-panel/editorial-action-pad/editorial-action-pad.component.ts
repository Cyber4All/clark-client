import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { LearningObjectService as LOUri} from 'app/core/learning-object.service';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';

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

  showAddEvaluator: boolean;
  addEvaluatorButton = false;

  @Input() revisedLearningObject: LearningObject;

  constructor(
    private router: Router,
    private learningObjectService: LearningObjectService,
    private learningObjectServiceUri: LOUri,
    private authService: AuthService
    ) { }

  async ngOnInit() {
  }

  get assignEvaluators() {
    const addEvaluatorUserPrivileges = ['admin', 'editor'];
    for (let i = 0; i < addEvaluatorUserPrivileges.length; i++) {
      if (this.authService.user.accessGroups.includes(addEvaluatorUserPrivileges[i])) {
        this.addEvaluatorButton = true;
      }
    }
    return this.addEvaluatorButton;
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
         (this.revisedLearningObject && this.revisedLearningObject.status === 'unreleased');
  }

  // Determines if an editor is not permitted to create a revision or make edits
  get notPermitted() {
    return (this.learningObject.status === 'released' &&
    (this.revisedLearningObject &&
      (this.revisedLearningObject.status === 'unreleased' || this.revisedLearningObject.status === 'rejected'))) ||
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
    if (this.revisedLearningObject) {
      this.router.navigate([`/admin/learning-object-builder/${this.revisedLearningObject.id}`]);
    } else {
      this.router.navigate([`admin/learning-object-builder/${this.learningObject.id}`]);
    }
  }

  // Create a revision and then redirects to the builder for the revision˝
  async createRevision() {
    const revisionUri: any = await this.learningObjectService
      .createRevision(this.learningObject.cuid, this.learningObject.author.username);
    this.revisedLearningObject = (await this.learningObjectServiceUri.fetchUri(revisionUri.revisionUri).toPromise())[0];
    this.router.navigate([`/onion/learning-object-builder/${this.revisedLearningObject.id}`]);
  }

  /**
   * Toggles the add evaluator modal from showing/hiding
   *
   * @param value True if showing, false otherwise
   */
  toggleAddEvaluatorModal(value: boolean) {
    this.showAddEvaluator = value;
  }
}
