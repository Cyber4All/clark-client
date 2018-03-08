import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { SuggestionService } from './services/suggestion.service';

@Component({
    selector: 'mappings-list',
    templateUrl: 'mappings.component.html',
    styleUrls: ['mappings.component.scss']
})

export class MappingsListComponent implements OnInit {

  // TODO: Add ability to deselect a mapped outcome

  @Input('mappings') allMappings;
  @Output('delete') delete: EventEmitter<string> = new EventEmitter<string>();

  constructor(public service: SuggestionService) { }

  ngOnInit() {
    // this.service.mappings.subscribe(m => this.allMappings = m);
  }

  deleteMapping(m) {
      this.delete.emit(m);
  }
}
