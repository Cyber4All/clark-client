import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { levels } from '@cyber4all/clark-taxonomy';
import { LearningOutcome } from '@cyber4all/clark-entity';
import {
  trigger,
  transition,
  style,
  animate,
  state
} from '@angular/animations';

@Component({
  selector: 'clark-outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss'],
  animations: [
    trigger('outcome', [
      state('open', style({ height: '*' })),
      state('*', style({ height: '84px' })),
      transition('* <=> *', animate('350ms ease')),
    ])
  ]
})
export class OutcomeComponent implements OnInit {
  @Input()
  outcome: LearningOutcome;
  @Input()
  totalOutcomes: number;
  @Input()
  active: boolean;

  @Output()
  unmap: EventEmitter<{
    standardOutcome: LearningOutcome;
    value: boolean;
  }> = new EventEmitter();

  outcomeLevels = Array.from(levels.values());

  // this value keeps track of the index of newly created outcomes, it will be incorrect when loading existing outcomes
  outcomeNumber = 1;

  @Output()
  selectedVerb: EventEmitter<string> = new EventEmitter();
  @Output()
  selectedLevel: EventEmitter<string> = new EventEmitter();
  @Output()
  textChanged: EventEmitter<string> = new EventEmitter();
  @Output()
  deleted: EventEmitter<void> = new EventEmitter();

  constructor() {}

  ngOnInit() {
    // set the outcomeNumber to however many outcomes are currently in the outcomes array
    this.outcomeNumber = this.totalOutcomes;
  }

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

  removeMapping(standardOutcome: LearningOutcome) {
    this.unmap.emit({ standardOutcome, value: false});
  }
}
