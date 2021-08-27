import { Component, OnInit } from '@angular/core';
import { BuilderStore } from '../../builder-store.service';
import { Collection } from 'app/core/collection.service';
import { HistoryService, HistorySnapshot } from 'app/core/history.service';

@Component({
  selector: 'onion-relevancy-builder-navbar',
  templateUrl: './builder-navbar.component.html',
  styleUrls: ['./builder-navbar.component.scss']
})
export class BuilderNavbarComponent implements OnInit {
  collection: Collection;
  // FIXME: This will need to set based on the data coming back once the service is in place
  revisedVersion = false;

  // map of state strings to icons and tooltips
  states: Map<string, { tip: string }>;
  historySnapshot: HistorySnapshot;

  constructor(
    private history: HistoryService,
    public store: BuilderStore
  ) {
    this.historySnapshot = this.history.snapshot();
  }

  ngOnInit(): void { }

  /**
   * Saves the data from the store and navigates back to the admin learning objects page
   */
  async save() {
    await this.store.save();
    this.historySnapshot.rewind('/admin/learning-objects');
  }
}
