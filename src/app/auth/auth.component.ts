import { Component, OnInit } from '@angular/core';
import { ModalService } from 'app/shared/modules/modals/modal.module';
import { NavbarService } from 'app/core/navbar.service';

@Component({
  selector: 'clark-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  constructor(public modalService: ModalService, private nav: NavbarService) {}

  ngOnInit() {
    this.nav.hide();
  }

}
