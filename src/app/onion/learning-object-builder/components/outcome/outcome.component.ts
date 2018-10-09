import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { levels } from '@cyber4all/clark-taxonomy';
import { LearningOutcome } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss']
})
export class OutcomeComponent {
  @Input() outcome: LearningOutcome;
  @Input() totalOutcomes: number;
  @Input() active: boolean;

  outcomeLevels = Array.from(levels.values());

  @Output() selectedVerb: EventEmitter<string> = new EventEmitter();
  @Output() selectedLevel: EventEmitter<string> = new EventEmitter();
  @Output() textChanged: EventEmitter<string> = new EventEmitter();

  constructor() { }

  emitVerb(val) {
    this.selectedVerb.emit(val);
  }

  emitLevel(val) {
    this.selectedLevel.emit(val);
  }

  emitText(val) {
    this.textChanged.emit(val);
  }

  get outcomeNumber(): number {
    return (this.totalOutcomes || 0) + 1;
  }

}
