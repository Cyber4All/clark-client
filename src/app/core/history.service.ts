import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface HistorySnapshot {
  /**
   * Rewind the history of the HistoryService to the last location in the snapshot
   *
   * @readonly
   * @memberof HistorySnapshot
   */
  rewind(): void;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private skipNextEvent: boolean;

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
   * @param {number} [index] a number representing the url in the history array to navigate to
   * @memberof HistoryService
   */
  back(index?: number): void {
    this.skipNextEvent = true;

    if (this.history.length > 1) {
      // we have a history of navigation through system to traverse
      if (index !== undefined) {
        // we passed an index, delete all history after this point
        this.history = this.history.slice(0, index);
        // now route to the current route (the specified point-in-time)
        this.router.navigateByUrl(this.currentRoute);
      } else {
        // we didn't pass an index, navigate one-level back
        this.router.navigateByUrl(this.history.pop());
      }
    } else {
      // we don't have a history of navigation through system, default to home
      this.router.navigateByUrl('/home');
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
       rewind: () => { this.back(index); }
    };
  }
}
