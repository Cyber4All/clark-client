import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { SuggestionService } from './services/suggestion.service';
import { OutcomeSuggestion } from '@cyber4all/clark-entity';

@Component({
    selector: 'onion-mappings-list',
    templateUrl: 'mappings.component.html',
    styleUrls: ['mappings.component.scss']
})

export class MappingsListComponent implements OnInit {
  // TODO: Add ability to deselect a mapped outcome

  @Input('mappings') mappings: Array<OutcomeSuggestion> = [];

  constructor(public service: SuggestionService) { }

  ngOnInit() {
    const m = this.service.mappings;
    this.mappings = m.currentValue;
  }

  deleteMapping(m) {
    if (m && this.mappings.filter(x => x.id === m.id).length) {
      this.service.removeMapping(m);
    }
  }
}
