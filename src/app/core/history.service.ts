import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface HistorySnapshot {
  /**
   * Rewind the history of the HistoryService to the last location in the snapshot
   *
   * @param {string} [defaultUrl] the route to be used in the event that there is no history yet
   *  (the app was just loaded to its current page)
   * @readonly
   * @memberof HistorySnapshot
   */
  rewind(defaultUrl?: string): void;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private skipNextEvent: boolean;

  /**
   * A stack containing the URLs of a user's navigation history
   */
  history: string[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(x => x instanceof NavigationEnd)
    ).subscribe((route: NavigationEnd) => {

      if (!this.skipNextEvent) {
        this.history.push(route.url);
      }

      this.skipNextEvent = false;
    });
  }

  /**
   * Retrieve the previous location as a string url
   *
   * @readonly
   * @memberof HistoryService
   */
  get previousRoute(): string {
    return this.history[this.history.length - 2];
  }

  /**
   * Retrieve the current location as a string url
   *
   * @readonly
   * @memberof HistoryService
   */
  get currentRoute(): string {
    return this.history[this.history.length - 1];
  }

  /**
   * Navigate backwards, either to a specific point-in-time (specified by the index parameter) or simply one-level back
   *
   * @param {number} index a number representing the url in the history array to navigate to
   * @param {string} defaultUrl the url to use as a default in the event there is back history (the app was loaded on this page);
   * @memberof HistoryService
   */
  back(index: number = 1, defaultUrl: string = '/home'): void {
    if (this.history.length > 1) {
      this.skipNextEvent = true;

      // we have a history of navigation through system to traverse
      if (index !== undefined) {
        // we passed an index, delete all history after this point
        this.history = this.history.slice(0, index);
        // now route to the current route (the specified point-in-time)
        this.router.navigateByUrl(this.currentRoute);
      }
    } else {
      // we don't have a history of navigation through system, use the default route
      this.skipNextEvent = false;
      this.router.navigateByUrl(defaultUrl);
    }
  }

  /**
   * Retrieves a 'snapshot' of the history array with a rewind function
   * @returns {HistorySnapshot}
   * @memberof HistoryService
   */
  snapshot(): HistorySnapshot {
    const index = this.history.length - 1;
    return {
       rewind: (defaultUrl: string = '/home') => { this.back(index, defaultUrl); }
    };
  }
}
