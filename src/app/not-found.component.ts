import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './core/auth.service';
import { NavbarService } from './core/navbar.service';

@Component({
  selector: 'clark-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
