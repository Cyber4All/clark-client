import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output
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
import { ClickOutsideModule } from 'ng-click-outside';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
  hiddenOverflow = true;

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

  constructor() { }

  ngOnInit() {
    // set the outcomeNumber to however many outcomes are currently in the outcomes array
    this.outcomeNumber = this.totalOutcomes;
  }

  /**
   * By default, the overflow should be set to hidden, but when
   * the dropdown button containing all the verbs is clicked, overflow should be set to visible
   * The overflow value is changed using ngStyle
   * @param visibleOverflow 
   */
  setOverflow(visibleOverflow) {
    if (visibleOverflow) {
      //set overflow to visible when the dropdown menu is clicked
      this.hiddenOverflow = false;
    } else {
      //set overflow to hidden by default
      this.hiddenOverflow = true;
    }
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
    this.unmap.emit({ standardOutcome, value: false });
  }
}
