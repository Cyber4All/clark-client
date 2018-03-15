import { Component, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit() {
    this.activeTab = TABS.MAPPINGS;
  }

  switchTab(tab: TABS, index?) {
    switch (tab) {
      case TABS.MAPPINGS:
        this.activeTab = tab;
        console.log('mappings');
        break;
      case TABS.SUGGESTIONS:
        this.activeTab = tab;
        console.log('suggestions', index);
        // this.suggestionLoad(index);
        break;
      case TABS.SEARCH:
        this.activeTab = tab;
        console.log('search', index);
        // this.openMappingsSearch(index);
        break;
      default:
        throw new Error('Invalid tab.');
    }
  }
}
