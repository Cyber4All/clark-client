import { Component, OnInit } from '@angular/core';
import { BuilderStore } from '../../builder-store.service';
import { Collection } from 'app/core/collection-module/collections.service';
import { HistoryService, HistorySnapshot } from 'app/core/history.service';

@Component({
  selector: 'onion-relevancy-builder-navbar',
  templateUrl: './builder-navbar.component.html',
  styleUrls: ['./builder-navbar.component.scss']
})
export class BuilderNavbarComponent implements OnInit {
  collection: Collection;

  cancelConfirmationOpen = false;

  historySnapshot: HistorySnapshot;

  routesClicked: Set<string> = new Set();

  constructor(
    private history: HistoryService,
    public store: BuilderStore
  ) {
    this.historySnapshot = this.history.snapshot();
  }

  ngOnInit(): void { }

  /**
   * Add the passed route to the set of clicked routes
   *
   * @param {string} route
   * @memberof BuilderNavbarComponent
   */
     triggerRouteClick(route: string) {
      this.routesClicked.add(route);
    }

  /**
   * Function to toggle the confirm cancel popup
   */
  attemptCancel() {
    if (!this.cancelConfirmationOpen) {
      this.cancelConfirmationOpen = true;
    }
  }

  /**
   * Saves the data from the store and navigates back to the admin learning objects page
   */
  async save() {
    await this.store.save();
    this.historySnapshot.rewind('/admin/learning-objects');
  }
}
