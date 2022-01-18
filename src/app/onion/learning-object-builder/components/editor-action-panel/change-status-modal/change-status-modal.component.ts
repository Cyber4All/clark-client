import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  OnInit
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
export class ChangeStatusModalComponent implements OnInit {
  @Input() shouldShow;
  @Input() learningObject: LearningObject;
  @Output() closed = new EventEmitter();
  selectedStatus: string;
  changelog: string;
  statuses = [];

  page: 1 | 2 = 1;
  direction: 'prev' | 'next' = 'next';

  serviceInteraction: boolean;

  constructor(
    private builderStore: BuilderStore,
    private changelogService: ChangelogService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.setValidStatusMoves();
  }

  closeModal() {
    this.closed.next();
  }

  private setValidStatusMoves() {
    switch (this.learningObject.status) {
      case LearningObject.Status.WAITING:
        this.statuses = [LearningObject.Status.REVIEW];
        break;
      case LearningObject.Status.REVIEW:
        this.statuses = [
          LearningObject.Status.ACCEPTED_MINOR,
          LearningObject.Status.ACCEPTED_MAJOR,
          LearningObject.Status.PROOFING,
        ];
        break;
      case LearningObject.Status.ACCEPTED_MINOR:
        this.statuses = [LearningObject.Status.REVIEW];
        break;
      case LearningObject.Status.ACCEPTED_MAJOR:
        this.statuses = [LearningObject.Status.REVIEW];
        break;
      case LearningObject.Status.PROOFING:
        this.statuses = [LearningObject.Status.RELEASED, LearningObject.Status.REJECTED];
    }
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
      case LearningObject.Status.RELEASED:
        return `Release this Learning Object`;
      case LearningObject.Status.PROOFING:
        return 'Move to Proofing';
      case LearningObject.Status.REVIEW:
        return 'Move to Review';
      case LearningObject.Status.WAITING:
        return 'Move to Waiting';
      case LearningObject.Status.ACCEPTED_MINOR:
        return 'Request Minor Changes';
      case LearningObject.Status.ACCEPTED_MAJOR:
        return 'Request Major Changes';
      case LearningObject.Status.REJECTED:
        return 'Reject this Learning Object';
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
      this.learningObject.status = this.selectedStatus as LearningObject.Status;
      this.setValidStatusMoves();
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
