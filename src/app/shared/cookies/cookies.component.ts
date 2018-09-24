import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss']
})
export class CookiesComponent implements OnInit {

  @Output() setAgreement: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  dismiss() {
    this.setAgreement.emit(true);
  }

}
