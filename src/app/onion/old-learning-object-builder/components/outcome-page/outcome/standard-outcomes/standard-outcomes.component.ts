import { Component, OnInit } from '@angular/core';
import { SuggestionService } from './suggestion/services/suggestion.service';

enum TABS {
  MAPPINGS,
  SUGGESTIONS,
  SEARCH
}

/**
 * Container component for all standard outcome functionality.
 * Handles tab selection and rendering of needed components.
 *
 * @class StandardOutcomesComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'onion-standard-outcomes',
  templateUrl: 'standard-outcomes.component.html',
  styleUrls: ['standard-outcomes.component.scss']
})
export class StandardOutcomesComponent implements OnInit {
  tabs = TABS;
  activeTab: TABS;

  constructor(public service: SuggestionService) { }

  ngOnInit() {
    this.activeTab = TABS.MAPPINGS;
  }

  switchTab(tab: TABS) {
    switch (tab) {
      case TABS.MAPPINGS:
        this.activeTab = tab;
        break;
      case TABS.SUGGESTIONS:
        this.activeTab = tab;
        break;
      case TABS.SEARCH:
        this.activeTab = tab;
        break;
      default:
        throw new Error('Invalid tab.');
    }
  }
}
