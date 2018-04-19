import { Component, OnInit } from '@angular/core';
import { SuggestionService } from '../../suggestion/services/suggestion.service';

enum TABS {
  MAPPINGS,
  SUGGESTIONS,
  SEARCH
}

@Component({
  selector: 'onion-standard-outcomes',
  templateUrl: 'standard-outcomes.component.html',
  styleUrls: ['standard-outcomes.component.scss']
})
export class StandardOutcomesComponent implements OnInit {
  tabs = TABS;
  activeTab: TABS;

  constructor(private service: SuggestionService) { }

  ngOnInit() {
    this.activeTab = TABS.MAPPINGS;
  }

  switchTab(tab: TABS, index?) {
    switch (tab) {
      case TABS.MAPPINGS:
        this.activeTab = tab;
        
        break;
      case TABS.SUGGESTIONS:
        this.activeTab = tab;
        
        // this.suggestionLoad(index);
        break;
      case TABS.SEARCH:
        this.activeTab = tab;
        
        // this.openMappingsSearch(index);
        break;
      default:
        throw new Error('Invalid tab.');
    }
  }
}
