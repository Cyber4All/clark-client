import { Component } from '@angular/core';
import { ModalService } from '../shared/modules/modals/modal.service';
import { NavbarService } from '../core/client-module/navbar.service';

@Component({
  selector: 'clark-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent {
  hideTopbar: any = false;
  filterButton = false;

  constructor(
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
