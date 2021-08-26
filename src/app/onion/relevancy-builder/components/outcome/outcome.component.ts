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
  selector: 'clark-relevancy-outcome',
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

  @Input() outcome: LearningOutcome;
  @Input() active: boolean;

  noAnimation = true;

  @Output()
  unmap: EventEmitter<{
    standardOutcome: LearningOutcome;
    value: boolean;
  }> = new EventEmitter();

  outcomeLevels = Array.from(levels.values());

  // this value keeps track of the index of newly created outcomes, it will be incorrect when loading existing outcomes
  outcomeNumber = 1;

  constructor(
    private cd: ChangeDetectorRef,
    public validator: LearningObjectValidator,
    public outcomeValidator: LearningOutcomeValidator
  ) {}

  ngOnInit() {}

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

  removeMapping(standardOutcome: LearningOutcome) {
    this.unmap.emit({ standardOutcome, value: false });
  }
}
