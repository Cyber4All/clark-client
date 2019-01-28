import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from '../shared/modals';
import { ToasterService } from '../shared/toaster';
import { NavbarService } from '../core/navbar.service';

@Component({
  selector: 'clark-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent implements OnInit {
  hideTopbar: any = false;
  filterButton = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public noteService: ToasterService,
    public modalService: ModalService,
    public nav: NavbarService,
  ) { }

  ngOnInit() {
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
