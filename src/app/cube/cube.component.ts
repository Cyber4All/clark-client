import { Component } from '@angular/core';
import { ModalService } from '../shared/modules/modals/modal.service';
import { NavbarService } from '../core/client-module/navbar.service';
import { ContextMenuComponent } from '../shared/modules/modals/contextmenu.component';
import { DialogMenuComponent } from '../shared/modules/modals/dialogmenu.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
    selector: 'clark-cube',
    templateUrl: './cube.component.html',
    styleUrls: ['./cube.component.scss'],
    standalone: true,
    imports: [ContextMenuComponent, DialogMenuComponent, RouterOutlet, FooterComponent]
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
