import { Component, OnInit } from '@angular/core';
import { Routes, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { BuilderStore } from '../../builder-store.service';
import { AuthService } from 'app/core/auth.service';
import { LearningObjectValidator } from '../../learning-object.validator';

@Component({
  selector: 'onion-builder-navbar',
  templateUrl: './builder-navbar.component.html',
  styleUrls: ['./builder-navbar.component.scss'],
  animations: [
    trigger('route', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate('250ms ease', style({ opacity: 1, transform: 'translateY(0px)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0px)' }),
        animate('300ms ease', style({ opacity: 0, transform: 'translateY(15px)' }))
      ])
    ])
  ]
})
export class BuilderNavbarComponent implements OnInit {

  constructor(private store: BuilderStore, private auth: AuthService, private validator: LearningObjectValidator) { }

  ngOnInit() {
  }

  canRoute(route: string) {
    switch (route) {
      case 'outcomes':
        return this.validator.saveable();
      case 'materials':
        return !!(this.auth.user.emailVerified && this.validator.saveable());
    }
  }

}
