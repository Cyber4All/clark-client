import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RelevancyService } from 'app/core/relevancy.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { LearningObject } from 'entity/learning-object/learning-object';
import { User } from 'entity/user/user';

@Component({
  selector: 'clark-admin-add-evaluator',
  templateUrl: './add-evaluator.component.html',
  styleUrls: ['./add-evaluator.component.scss']
})
export class AddEvaluatorComponent implements OnInit {

  selectedLearningObjects: LearningObject[];

  @Input() user: User;
  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(
      private relevancyService: RelevancyService,
      private toaster: ToastrOvenService,
    ) { }

  ngOnInit(): void {}

  setSelectedLearningObjects(learningObjects: LearningObject[]) {
    if (learningObjects) {
      this.selectedLearningObjects = learningObjects;
    }
  }

  async assignEvaluators() {
    if (this.user && this.checkEvaluatorsBody(this.selectedLearningObjects)) {
      const cuids = this.selectedLearningObjects.map( obj => obj.cuid );
      const assignerId = this.user.id;

      await this.relevancyService.assignEvaluators({
        cuids: cuids,
        assignerIds: [assignerId]
      })
      .then( () => {
        this.toaster.success(
          'Success',
          'The selected evaluators were assigned.'
        );
        this.close.emit();
      })
      .catch( e => {
        this.toaster.error(
          'Error assigning evaluators',
          JSON.parse(e.error).message
        );
      });
    } else {
      this.toaster.error(
        'Error',
        'Atleast one learning object and evaluator must be selected for assignment.'
      );
    }
  }

  private checkEvaluatorsBody(arg: any[]): boolean {
    return (arg && arg.length > 0);
  }

}
