import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'onion-learning-object-outcome-container',
  templateUrl: 'outcome-container.component.html',
  styleUrls: [ 'outcome-container.component.scss' ]
})
export class LearningObjectOutcomeContainerComponent implements OnInit {

  @Input() learningObject;
  @Input() submitted;
  @Output() newOutcomeRequest = new EventEmitter<string>();
  @Output() deleteOutcomeRequest = new EventEmitter<number>();

  constructor() { }

  ngOnInit() { }

  newOutcome() {
    this.newOutcomeRequest.next('NEW_OUTCOME');
  }

  deleteOutcome(index) {
    this.deleteOutcomeRequest.next(index);
  }
}
