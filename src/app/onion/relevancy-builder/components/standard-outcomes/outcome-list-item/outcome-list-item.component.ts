import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BuilderStore } from 'app/onion/relevancy-builder/builder-store.service';
import { SuggestedOutcome } from '../standard-outcomes.component';

@Component({
  selector: 'clark-outcome-relevancy-item',
  templateUrl: './outcome-list-item.component.html',
  styleUrls: ['./outcome-list-item.component.scss']
})
export class OutcomeListItemComponent implements OnInit {

  @Input() guideline: SuggestedOutcome;
  @Input() selected: boolean;

  @Output() toggleMap: EventEmitter<boolean> = new EventEmitter();

  constructor(
    public store: BuilderStore
  ) { }

  ngOnInit(): void {
  }

}
