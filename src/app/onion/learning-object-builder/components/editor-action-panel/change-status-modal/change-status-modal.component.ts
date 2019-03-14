import {Component, EventEmitter, Input, Output, ChangeDetectorRef} from '@angular/core';
import {LearningObject} from '@cyber4all/clark-entity';
import {BUILDER_ACTIONS, BuilderStore} from '../../../builder-store.service';
import { trigger, transition, style, animate, state, query } from '@angular/animations';

@Component({
  selector: 'clark-change-status-modal',
  templateUrl: './change-status-modal.component.html',
  styleUrls: ['./change-status-modal.component.scss'],
  animations: [
    trigger('carousel', [
      transition('void => next', [
        style({ transform: 'translateX(600px)', opacity: 0 }),
        animate('300ms 150ms ease', style({ transform: 'translateX(0) ', opacity: 1 }))
      ]),
      transition('next => void', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('300ms ease', style({ transform: 'translateX(-600px)', opacity: 0 }))
      ]),
      transition('void => prev', [
        style({ transform: 'translateX(-600px)', opacity: 0 }),
        animate('300ms 150ms ease', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition('prev => void', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('300ms ease', style({ transform: 'translateX(600px)', opacity: 0 }))
      ])
    ]),
  ]
})
export class ChangeStatusModalComponent {
  @Input() shouldShow;
  @Input() learningObject: LearningObject;
  @Output() closed = new EventEmitter();
  selectedStatus: string;
  changelog: string;
  statuses = [
    'released',
    'proofing',
    'review',
    'waiting'
  ];

  constructor(private builderStore: BuilderStore, private cd: ChangeDetectorRef) { }

  page: 1 | 2 = 1;
  direction: 'prev' | 'next' = 'next';

  closeModal() {
    this.closed.next();
  }

  advance() {
    this.direction = 'next';
    this.cd.detectChanges();
    this.page = 2;
  }

  regress() {
    this.direction = 'prev';
    this.cd.detectChanges();
    this.page = 1;
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
