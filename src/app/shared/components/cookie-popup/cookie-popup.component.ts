import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'clark-cookie-popup',
  templateUrl: './cookie-popup.component.html',
  styleUrls: ['./cookie-popup.component.scss']
})
export class CookiePopupComponent {
  @Output() acceptsCookie: EventEmitter<boolean> = new EventEmitter();

  agree() {
    this.acceptsCookie.emit(true);
  }
}
