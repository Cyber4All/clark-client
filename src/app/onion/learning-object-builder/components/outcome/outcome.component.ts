import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { levels } from '@cyber4all/clark-taxonomy';
import { LearningOutcome } from '@cyber4all/clark-entity';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'clark-outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss'],
  animations: [
    trigger('outcome', [
      state('open', style({ height: '*' })),
      state('closed', style({ height: '84px' })),
      transition('* <=> *', animate('350ms ease')),
    ])
  ]
})
export class OutcomeComponent {
  @Input() outcome: LearningOutcome;
  @Input() totalOutcomes: number;
  @Input() active: boolean;

  outcomeLevels = Array.from(levels.values());

  @Output() selectedVerb: EventEmitter<string> = new EventEmitter();
  @Output() selectedLevel: EventEmitter<string> = new EventEmitter();
  @Output() textChanged: EventEmitter<string> = new EventEmitter();
  @Output() deleted: EventEmitter<void> = new EventEmitter();

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

  emitDeletion() {
    this.deleted.emit();
  }

  get outcomeNumber(): number {
    return (this.totalOutcomes || 1);
  }

}
