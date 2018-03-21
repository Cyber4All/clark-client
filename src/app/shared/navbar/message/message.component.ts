import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

  showing: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  open() {
    this.showing = true;
  }

  close() {
    this.showing = false;
  }

  toggle() {
    this.showing = !this.showing;
  }

}
