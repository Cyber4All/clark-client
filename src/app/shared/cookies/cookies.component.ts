import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss']
})
export class CookiesComponent {

  @Output() setAgreement: EventEmitter<boolean> = new EventEmitter();

  /**
   * Emits agreement event to parent component
   */
  dismiss() {
    this.setAgreement.emit(true);
  }

}
