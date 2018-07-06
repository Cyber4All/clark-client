import { Component, OnInit, Input } from '@angular/core';
import { SuggestionService } from '../suggestion/services/suggestion.service';
import { OutcomeSuggestion } from '@cyber4all/clark-entity';

/**
 * Displays a list of outcomes that the user has mapped to their outcome.
 *
 * @export
 * @class MappingsListComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'onion-mappings-list',
  templateUrl: 'mappings-list.component.html',
  styleUrls: ['mappings-list.component.scss']
})
export class MappingsListComponent implements OnInit {

  @Input() mappings: Array<OutcomeSuggestion> = [];

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
