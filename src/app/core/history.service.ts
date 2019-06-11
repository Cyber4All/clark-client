import { Injectable } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  history: NavigationEnd[] = [];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(x => x instanceof NavigationStart)
    ).subscribe((route: NavigationEnd) => {
      this.history.push(route);
    });
  }

  get lastRoute() {
    return this.history[this.history.length - 2];
  }


  get currentRoute() {
    return this.history[this.history.length - 1];
  }
}
