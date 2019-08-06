import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private skip: boolean;

  history: NavigationEnd[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(x => x instanceof NavigationEnd)
    ).subscribe((route: NavigationEnd) => {

      if (!this.skip) {
        this.history.push(route);
      }

      this.skip = false;
    });
  }

  /**
   * Retrieve the previous location as a NavigationEnd Event
   *
   * @readonly
   * @memberof HistoryService
   */
  get lastRoute(): NavigationEnd {
    return this.history[this.history.length - 2];
  }


  /**
   * Retrieve the current location as a NavigationEnd Event
   *
   * @readonly
   * @memberof HistoryService
   */
  get currentRoute() {
    return this.history[this.history.length - 1];
  }

  /**
   * Navigate backwards whee
   *
   * @param {number} [index]
   * @memberof HistoryService
   */
  back(index?: number) {
    this.skip = true;

    if (this.history.length > 1) {
      // we have a history of navigation through system to traverse
      if (index !== undefined) {
        // we passed an index, delete all history after this point
        this.history = this.history.slice(0, index);
        // now route to the current route (the specified point-in-time)
        this.router.navigateByUrl(this.currentRoute.url);
      } else {
        // we didn't pass an index, navigate one-level back
        this.router.navigateByUrl(this.history.pop().url);
      }
    } else {
      // we don't have a history of navigation through system, default to home
      this.router.navigateByUrl('/home');
    }

  }

  /**
   * Returns a function that navigates "1-level back" from the moment in time the "snapshot" function was called
   *
   * @memberof HistoryService
   */
  snapshot(): Function {
    const index = this.history.length - 1;

    return () => {
      this.back(index);
    };
  }
}
