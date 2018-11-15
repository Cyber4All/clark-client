import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations'

@Component({
  selector: 'clark-connection-retry',
  templateUrl: './connection-retry.component.html',
  styleUrls: ['./connection-retry.component.scss'],
  animations: [
    trigger('enter', [
      transition(':enter', [
        style({ opacity: 0, bottom: '-80px', visibility: 'hidden' }),
        animate('400ms ease', style({ opacity: 1, bottom: '0px', visibility: 'visible' }),)
      ])
    ])
  ]
})
export class ConnectionRetryComponent {

  count = 59;

  constructor() {
    setInterval(() => {
      if (this.count - 1 == 0) {
        this.reload();
      } else {
        this.count--;
      }
    }, 1000)
  }

  reload() {
    window.location.reload();
  }

}
