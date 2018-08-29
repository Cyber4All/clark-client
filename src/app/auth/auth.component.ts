import { Component, OnInit } from '@angular/core';
import { ModalService } from '../shared/modals/modal.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  constructor(public modalService: ModalService) {}

  ngOnInit() {}

}
