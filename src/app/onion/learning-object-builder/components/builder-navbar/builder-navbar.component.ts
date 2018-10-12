import { Component, OnInit } from '@angular/core';
import { Routes, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'onion-builder-navbar',
  templateUrl: './builder-navbar.component.html',
  styleUrls: ['./builder-navbar.component.scss'],
  animations: [
    trigger('builderNavbar', [
      transition(':enter', [
        style({ 'transform': 'translateY(-200px)', opacity: 0 }),
        animate('300ms 200ms ease', style({ 'transform': 'translateY(0px)', opacity: 1 }))
      ])
    ])
  ]
})
export class BuilderNavbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
