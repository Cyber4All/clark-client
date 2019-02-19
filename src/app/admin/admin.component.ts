import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from 'app/core/navbar.service';

@Component({
  selector: 'clark-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  constructor(private navbarService: NavbarService) { }

  ngOnInit() {
    this.navbarService.hide();
  }

  ngOnDestroy() {
    this.navbarService.show();
  }

}
