import { Component, OnInit } from '@angular/core';
import { ModalService } from '../shared/Shared Modules/modals/modal.service';
import { ToasterService } from '../shared/Shared Modules/toaster';
import { NavbarService } from '../core/navbar.service';

@Component({
  selector: 'clark-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent {
  hideTopbar: any = false;
  filterButton = false;

  constructor(
    public noteService: ToasterService,
    public modalService: ModalService,
    public nav: NavbarService,
  ) {
    this.nav.show();
  }

  filterButtonClick() {
    this.filterButton = !this.filterButton;
  }

  filterButtonClickAway() {
    if (this.filterButton) {
      this.filterButtonClick();
    }
  }
}
