import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LearningObject} from '@cyber4all/clark-entity';
import {BUILDER_ACTIONS, BuilderStore} from '../../../builder-store.service';

@Component({
  selector: 'clark-change-status-modal',
  templateUrl: './change-status-modal.component.html',
  styleUrls: ['./change-status-modal.component.scss']
})
export class ChangeStatusModalComponent {
  @Input() shouldShow;
  @Input() learningObject: LearningObject;
  @Output() closed = new EventEmitter();
  selectedStatus: string;
  statuses = [
    'released',
    'proofing',
    'review',
    'waiting'
  ];

  constructor(private builderStore: BuilderStore) { }

  closeModal() {
    this.closed.next();
  }

  advance() {
    alert('advancing');
  }

  regress() {
    alert('regressing');
  }

  getStatusText(status: string) {
    switch (status) {
      case 'released':
        return `Release this Learning Object`;
      case 'proofing':
        return 'Move to Proofing';
      case 'review':
        return 'Move to Review';
      case 'waiting':
        return 'Move to Waiting';
    }
  }

  updateStatus() {
    this.builderStore.execute(BUILDER_ACTIONS.MUTATE_OBJECT, { status: this.selectedStatus})
      .then(() => {
        this.closeModal();
      })
      .catch(error => {
        console.error(error);
      });
  }
}
