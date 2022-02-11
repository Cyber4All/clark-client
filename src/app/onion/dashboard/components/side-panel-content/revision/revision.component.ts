import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { LearningObject } from 'entity/learning-object/learning-object';
import { card, nullAnimation } from './revision.animations';

@Component({
  selector: 'clark-revision',
  templateUrl: './revision.component.html',
  styleUrls: ['./revision.component.scss'],
  animations: [ card, nullAnimation ]
})
export class RevisionComponent implements OnChanges {
  @Input() hasRevision: boolean;
  @Input() revision: LearningObject;

  @Output() createRevision: EventEmitter<void> = new EventEmitter();
  @Output() submit: EventEmitter<void> = new EventEmitter();
  @Output() cancelSubmission: EventEmitter<void> = new EventEmitter();
  @Output() delete: EventEmitter<void> = new EventEmitter();

  meatballOpen: boolean;
  deleteConfirmationOpen: boolean;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.hasRevision = false;

    if (this.revision) {
      this.hasRevision = true;
    }
  }

    /**
     * Toggles the context menu on and off
     */
  toggleContextMenu() {
    this.meatballOpen = !this.meatballOpen;
  }

  /**
   * Create a revision of the object that is currently released
   */
  makeRevision() {
    this.createRevision.emit();
    this.hasRevision = true;
  }

  attemptDelete() {
    this.deleteConfirmationOpen = true;
  }

  /**
   * Given a string representation of a context menu action, returns true if that action should be allowed based on
   * parameters such as learing object length and learning object status
   *
   * @param action {string} the action in question
   */
  actionPermissions(action: string) {
    const permissions = {
      edit: ['unreleased', 'denied'],
      editChildren: [
        'unreleased',
        'denied',
        this.revision.length !== 'nanomodule'
      ],
      manageMaterials: ['unreleased', 'denied'],
      submit: ['unreleased', 'denied'],
      view: ['released'],
      delete: ['unreleased', 'denied'],
      cancelSubmission: ['waiting'],
      infoPanel: ['released']
    };

    const p = permissions[action];

    if (p.includes(false)) {
      return false;
    }

    return p.includes(this.revision.status);
  }
}
