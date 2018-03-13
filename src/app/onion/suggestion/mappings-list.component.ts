import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SuggestionService } from './services/suggestion.service';

@Component({
    selector: 'onion-mappings-list',
    templateUrl: 'mappings.component.html',
    styleUrls: ['mappings.component.scss']
})

export class MappingsListComponent implements OnInit {
  // TODO: Add ability to deselect a mapped outcome

  @Output('delete') delete: EventEmitter<string> = new EventEmitter<string>();
  mappings;
  showMappings = false;

  constructor(public service: SuggestionService) { }

  ngOnInit() {
    const m = this.service.mappings;
    this.mappings = m.currentValue;
    this.showMappings = this.mappings.length > 1;
    m.observable.subscribe(data => {
      this.mappings = data;
      this.showMappings = this.mappings.length > 1;
    });
  }

  deleteMapping(m) {
    this.delete.emit(m.id);
  }
}
