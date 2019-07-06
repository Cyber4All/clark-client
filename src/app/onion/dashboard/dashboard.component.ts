import { Component, OnInit } from '@angular/core';
import { HistoryService } from 'app/core/history.service';
import { NavigationEnd, Router } from '@angular/router';
import { NavbarService } from 'app/core/navbar.service';

@Component({
  selector: 'clark-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  lastLocation: NavigationEnd;

  constructor(
    private history: HistoryService,
    private router: Router,
    private navbar: NavbarService
  ) {
    this.navbar.hide();
    this.lastLocation = this.history.lastRoute;
  }

  navigateBack() {
    let url = '/home';

    if (this.lastLocation && !this.lastLocation.url.includes('onion')) {
      url = this.lastLocation.url;
    }

    this.router.navigateByUrl(url);
  }
}
