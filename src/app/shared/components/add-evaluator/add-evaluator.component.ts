import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '@entity';
import { RelevancyService } from 'app/core/relevancy.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { LearningObject } from 'entity/learning-object/learning-object';

@Component({
  selector: 'clark-add-evaluator',
  templateUrl: './add-evaluator.component.html',
  styleUrls: ['./add-evaluator.component.scss']
})
export class AddEvaluatorComponent implements OnInit {

  selectedEvaluators: User[];

  @Input() highlightedLearningObjects: LearningObject[];
  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(private relevancyService: RelevancyService, private toaster: ToastrOvenService) { }

  ngOnInit(): void {
  }

  setSelectedEvaluators(evaluators) {
    if (evaluators) {
      this.selectedEvaluators = evaluators;
    }
  }

  async assignEvaluators() {
    if (this.checkEvaluatorsBody(this.highlightedLearningObjects) && this.checkEvaluatorsBody(this.selectedEvaluators)) {
      const cuids = this.highlightedLearningObjects.map( obj => obj.cuid );
      const assignerIds = this.selectedEvaluators.map( obj => obj.id );

      await this.relevancyService.assignEvaluators({
        cuids: cuids,
        assignerIds: assignerIds
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
