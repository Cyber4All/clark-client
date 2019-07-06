import { Component } from '@angular/core';
import { ModalService } from '../shared/modals/modal.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  constructor(public modalService: ModalService) {}

}
