import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SuggestedOutcome } from '../standard-outcomes.component';
import { NgClass } from '@angular/common';
import { ActivateDirective } from '../../../../../shared/directives/activate.directive';

@Component({
    selector: 'clark-outcomes-list-item',
    templateUrl: './outcomes-list-item.component.html',
    styleUrls: ['./outcomes-list-item.component.scss'],
    standalone: true,
    imports: [NgClass, ActivateDirective]
})
export class OutcomesListItemComponent implements OnInit {
  @Input() guideline: SuggestedOutcome;
  @Input() selected: boolean;

  @Output() toggleMap: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
