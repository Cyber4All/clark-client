import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'onion-learning-object-outcome-container',
  templateUrl: 'outcome-page.component.html',
  styleUrls: [ 'outcome-page.component.scss' ]
})
export class LearningObjectOutcomePageComponent implements OnInit {

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
