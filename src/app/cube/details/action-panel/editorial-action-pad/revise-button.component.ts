import { Component, Input } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-revise-button',
  template: `
    <button
      *ngIf="learningObject.status === 'released' && hasRevision"
      [disabled]="learningObject.status === 'released'"
      class="button neutral"
      aria-label="Released Learning Objects cannot be Revised">
      Revisions not permitted
      TODO: Add tooltip
    </button>
    <button
      *ngIf="learningObject.status === 'released' && !hasRevision"
      class="button neutral"
      (click)="openCreateRevisionModal()"
      aria-label="Clickable Create Revision button">
      Create a Revision
    </button>
    <clark-popup *ngIf="openRevisionModal" (closed)="closeRevisionModal()">
      <div #popupInner style="max-width: 600px;">
        <clark-revision-notice-popup (close)="closeRevisionModal()"></clark-revision-notice-popup>
      </div>
    </clark-popup>
  `,
  styleUrls: ['./revise-button.component.scss']
})
export class ReviseButtonComponent {
  @Input() learningObject: LearningObject;
  openRevisionModal: boolean;
  showPopup = false;
  hasRevision: boolean;

  constructor() { }

  async openCreateRevisionModal() {
    if (!this.openRevisionModal) {
      this.openRevisionModal = true;
    }
  }


  closeRevisionModal() {
    this.openRevisionModal = false;
  }

}
