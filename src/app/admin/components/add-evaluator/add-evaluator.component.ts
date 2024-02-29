import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RelevancyService } from 'app/core/learning-object-module/relevancy.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { LearningObject } from 'entity/learning-object/learning-object';
import { User } from 'entity/user/user';

@Component({
  selector: 'clark-admin-add-evaluator',
  templateUrl: './add-evaluator.component.html',
  styleUrls: ['./add-evaluator.component.scss']
})
export class AddEvaluatorComponent implements OnInit {

  assignedLearningObjects: LearningObject[] = [];
  removedLearningObjects: LearningObject[] = [];

  @Input() user: User;
  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(
    private relevancyService: RelevancyService,
    private toaster: ToastrOvenService,
  ) { }

  ngOnInit(): void { }

  setSelectedLearningObjects(learningObjects: {
    add: LearningObject[],
    remove: LearningObject[]
  }) {
    if (learningObjects) {
      this.assignedLearningObjects = learningObjects.add ? learningObjects.add : [];
      this.removedLearningObjects = learningObjects.remove ? learningObjects.remove : [];
    }
  }

  get canNotAssign(): boolean {
    return (this.assignedLearningObjects.length === 0 && this.removedLearningObjects.length === 0);
  }

  async saveEvaluators() {
    if (this.user) {
      await this.removeEvaluators();
      await this.assignEvaluators();
    }
  }

  async removeEvaluators() {
    if (this.checkEvaluatorsBody(this.removedLearningObjects)) {
      const cuids = this.removedLearningObjects.map(obj => obj.cuid);
      const assignerId = this.user.id;

      await this.relevancyService.removeEvaluators({
        cuids: cuids,
        assignerIds: [assignerId]
      })
        .then(() => {
          this.toaster.success(
            'Success',
            'The evaluators were removed.'
          );
          this.close.emit();
        })
        .catch(e => {
          this.toaster.error(
            'Error removing evaluators',
            JSON.parse(e.error).message
          );
        });
    }
  }

  async assignEvaluators() {
    if (this.user && this.checkEvaluatorsBody(this.assignedLearningObjects)) {
      const cuids = this.assignedLearningObjects.map(obj => obj.cuid);
      const assignerId = this.user.id;

      await this.relevancyService.assignEvaluators({
        cuids: cuids,
        assignerIds: [assignerId]
      })
        .then(() => {
          this.toaster.success(
            'Success',
            'The selected evaluators were assigned.'
          );
          this.close.emit();
        })
        .catch(e => {
          this.toaster.error(
            'Error assigning evaluators, please try again later',
            JSON.parse(e.error).message
          );
        });
    }
  }

  private checkEvaluatorsBody(arg: any[]): boolean {
    return (arg && arg.length > 0);
  }

}
