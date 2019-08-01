import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';

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
  showRevisionPopup = false;
  openRevisionModal: boolean;
  openEditModal: boolean;
  showPopup = false;

  // TODO: Make HTTP requests for creating a revision
  // TODO: Route the user to the builder depending on what button they click
  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log(this.learningObject.status);
  }

  // Determines if an editor can create a revision of a learning object
  get makeRevision() {
    return this.learningObject.status === 'released' && !this.hasRevision;
  }

  // Determines if an editor can make edits to a waiting, review, or proofing learning object
  get makeEdits() {
    return this.learningObject.status !== 'released'
      && this.learningObject.status !== 'unreleased'
      && this.learningObject.status !== 'rejected';
  }

  // Determines if an editor is not permitted to create a revision or make edits
  get notPermitted() {
    return (this.learningObject.status === 'unreleased' || this.learningObject.status === 'rejected')
      || (this.learningObject.status === 'released' && this.hasRevision);
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

  // Handles opening the make edit modal
  openMakeEditModal() {
    if (!this.openEditModal) {
      this.openEditModal = true;
    }
  }
  // Handles closing the make edit modal
  closeEditModal() {
    this.openEditModal = false;
  }

}
