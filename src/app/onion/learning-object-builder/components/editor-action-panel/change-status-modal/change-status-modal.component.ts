import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef
} from '@angular/core';
import { LearningObject } from '@entity';
import { BUILDER_ACTIONS, BuilderStore } from '../../../builder-store.service';
import { ChangelogService } from 'app/core/changelog.service';
import { carousel } from './clark-change-status-modal.animations';

@Component({
  selector: 'clark-change-status-modal',
  templateUrl: './change-status-modal.component.html',
  styleUrls: ['./change-status-modal.component.scss'],
  animations: [ carousel ]
})
export class ChangeStatusModalComponent {
  @Input() shouldShow;
  @Input() learningObject: LearningObject;
  @Output() closed = new EventEmitter();
  selectedStatus: string;
  changelog: string;
  statuses = ['released', 'proofing', 'review', 'waiting'];

  constructor(
    private builderStore: BuilderStore,
    private changelogService: ChangelogService,
    private cd: ChangeDetectorRef
  ) {}

  page: 1 | 2 = 1;
  direction: 'prev' | 'next' = 'next';

  serviceInteraction: boolean;

  closeModal() {
    this.closed.next();
  }

  /**
   * Navigate to the RTF to create a changelog
   */
  advance() {
    this.direction = 'next';
    this.cd.detectChanges();
    this.page = 2;
  }

  /**
   * Navigate to the list of available statuses
   */
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

  /**
   * Update the status of the learning object to the selected value
   */
  async updateStatus() {
    this.serviceInteraction = true;
    await Promise.all([
      this.builderStore
      .execute(BUILDER_ACTIONS.MUTATE_OBJECT, { status: this.selectedStatus })
      .catch(error => {
        console.error(error);
      }),
      this.changelog ? this.createChangelog() : undefined
    ]).then(() => {
      this.closeModal();
      this.serviceInteraction = false;
    }).catch(error => {
      console.log('An error occurred!');
      this.serviceInteraction = false;
    });
  }

  /**
   * Create a new changelog for the active learning object
   */
  async createChangelog(): Promise<{}> {
    return this.changelogService.createChangelog(
      this.builderStore.learningObjectEvent.getValue().author.id,
      this.builderStore.learningObjectEvent.getValue().cuid,
      this.changelog,
    );
  }
}
