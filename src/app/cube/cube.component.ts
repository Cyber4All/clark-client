import { Component, OnInit } from '@angular/core';
import { ModalService } from '../shared/modals';
import { ToasterService } from '../shared/toaster';

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
  ) { }

  filterButtonClick() {
    this.filterButton = !this.filterButton;
  }

  filterButtonClickAway() {
    if (this.filterButton) {
      this.filterButtonClick();
    }
  }
}
