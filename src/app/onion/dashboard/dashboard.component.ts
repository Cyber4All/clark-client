import { Component, OnInit } from '@angular/core';
import { HistoryService } from 'app/core/history.service';
import { NavigationEnd, Router } from '@angular/router';
import { NavbarService } from 'app/core/navbar.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'clark-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  lastLocation: NavigationEnd;
  activeIndex = 0;

  action$: Subject<string> = new Subject();

  constructor(
    private history: HistoryService,
    private router: Router,
    private navbar: NavbarService
  ) {
    this.navbar.hide();
    this.lastLocation = this.history.lastRoute;
  }

  toggle() {
    if (this.activeIndex % 2) {
      this.action$.next('-1');
    } else {
      this.action$.next('+1');
    }
    this.activeIndex++;
  }

  navigateBack() {
    let url = '/home';

    if (this.lastLocation && !this.lastLocation.url.includes('onion')) {
      url = this.lastLocation.url;
    }

    this.router.navigateByUrl(url);
  }
}
