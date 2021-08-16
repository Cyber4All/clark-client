import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SuggestedOutcome } from '../standard-outcomes.component';

@Component({
  selector: 'clark-outcome-relevancy-item',
  templateUrl: './outcome-list-item.component.html',
  styleUrls: ['./outcome-list-item.component.scss']
})
export class OutcomeListItemComponent implements OnInit {

  @Input() outcome: SuggestedOutcome;
  @Input() selected: boolean;

  @Output() toggleMap: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
