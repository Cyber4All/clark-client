import { LearningObjectService } from './learning-object.service';
import { Component, OnInit } from '@angular/core';
import { ModalService, Position, ModalListElement } from '../shared/modals';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NotificationService } from '../shared/notifications';

@Component({
  selector: 'clark-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent implements OnInit {
  hideTopbar: any = false;
  filterButton = false;

  constructor(private router: Router, private route: ActivatedRoute, private noteService: NotificationService, private modalService: ModalService) { }

  ngOnInit() {
    
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
