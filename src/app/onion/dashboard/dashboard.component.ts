import { Component, OnInit } from '@angular/core';
import { NavbarService } from 'app/core/navbar.service';

@Component({
  selector: 'clark-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private navbarService: NavbarService) {
    this.navbarService.hide();
  }

  ngOnInit() {
  }

}
