import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SuggestedOutcome } from '../standard-outcomes.component';

@Component({
  selector: 'clark-outcomes-list-item',
  templateUrl: './outcomes-list-item.component.html',
  styleUrls: ['./outcomes-list-item.component.scss']
})
export class OutcomesListItemComponent implements OnInit {
  @Input() guideline: SuggestedOutcome;
  @Input() selected: boolean;

  @Output() toggleMap: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
