import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@entity';
import { SearchService } from 'app/admin/core/search.service';
import { RelevancyService } from 'app/core/relevancy.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { LearningObject } from 'entity/learning-object/learning-object';

@Component({
  selector: 'clark-add-evaluator',
  templateUrl: './add-evaluator.component.html',
  styleUrls: ['./add-evaluator.component.scss']
})
export class AddEvaluatorComponent implements OnInit {

  assignedEvaluators: User[] = [];
  removedEvaluators: User[] = [];

  @Input() learningObject: LearningObject;
  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(
      private relevancyService: RelevancyService,
      private toaster: ToastrOvenService,
      private router: Router,
      private searchService: SearchService
    ) { }

  ngOnInit(): void { }

  setEvaluators(evaluators: {
    add: User[],
    remove: User[]
  }) {
    if (evaluators) {
      this.assignedEvaluators = evaluators.add ? evaluators.add : [];
      this.removedEvaluators = evaluators.remove ? evaluators.remove : [];
    }
  }

  get canNotAssign(): boolean {
    return (this.assignedEvaluators.length == 0 && this.removedEvaluators.length == 0);
  }

  async saveEvaluators() {
    if (this.learningObject) {
      await this.removeEvaluators();
      await this.assignEvaluators();
      this.searchService.registerChange();
    }
  }

  async removeEvaluators() {
    if (this.checkEvaluatorsBody(this.removedEvaluators)) {
      const cuid = this.learningObject.cuid;
      const assignerIds = this.removedEvaluators.map( obj => obj.id );

      await this.relevancyService.removeEvaluators({
        cuids: [cuid],
        assignerIds: assignerIds
      })
      .then( () => {
        this.toaster.success(
          'Success',
          'The evaluators were removed.'
        );
        this.close.emit();
      })
      .catch( e => {
        this.toaster.error(
          'Error removing evaluators',
          JSON.parse(e.error).message
        );
      });
    }
  }

  async assignEvaluators() {
    if (this.checkEvaluatorsBody(this.assignedEvaluators)) {
      const cuid = this.learningObject.cuid;
      const assignerIds = this.assignedEvaluators.map( obj => obj.id );

      // Filter out any evaluators already existing on this.learningObject
      if (this.learningObject.assigned) {
        this.learningObject.assigned.forEach( id => {
          const index = assignerIds.indexOf(id);
          if (index !== -1) {
            assignerIds.splice(index, 1);
          }
        });
      }

      await this.relevancyService.assignEvaluators({
        cuids: [cuid],
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
    }
  }

  private checkEvaluatorsBody(arg: any[]): boolean {
    return (arg && arg.length > 0);
  }
}
