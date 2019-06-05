import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef
} from '@angular/core';
import { levels } from '@cyber4all/clark-taxonomy';
import { LearningOutcome } from '@entity';
import {
  trigger,
  transition,
  style,
  animate,
  state
} from '@angular/animations';
import { LearningObjectValidator } from '../../validators/learning-object.validator';
import { LearningOutcomeValidator } from '../../validators/learning-outcome.validator';

@Component({
  selector: 'clark-outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss'],
  animations: [
    trigger('outcome', [
      state('open', style({ height: '*', opacity: 1 })),
      state('closed', style({ height: '80px', opacity: 1 })),
      transition('* <=> *', animate('350ms ease'))
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

  noAnimation = true;

  @Output()
  unmap: EventEmitter<{
    standardOutcome: LearningOutcome;
    value: boolean;
  }> = new EventEmitter();

  showDeleteConfirm = false;

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

  constructor(
    private cd: ChangeDetectorRef,
    public validator: LearningObjectValidator,
    public outcomeValidator: LearningOutcomeValidator
  ) {}

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
      // set overflow to visible when the dropdown menu is clicked
      this.hiddenOverflow = false;
    } else {
      // set overflow to hidden by default
      this.hiddenOverflow = true;
    }
  }

  emitVerb(val) {
    if (val) {
      this.selectedVerb.emit(val);
    }
  }

  emitLevel(val) {
    if (val) {
      this.selectedLevel.emit(val);
    }
  }

  emitText(val) {
    if (val) {
      this.textChanged.emit(val);
    }
  }

  emitDeletion() {
    this.deleted.emit();
  }

  removeMapping(standardOutcome: LearningOutcome) {
    this.unmap.emit({ standardOutcome, value: false });
  }
}
