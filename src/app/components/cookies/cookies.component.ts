import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GLOBAL } from '@env/strings';

@Component({
  selector: 'clark-cookies',
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss']
})
export class CookiesComponent {

  @Output() showCookieBanner: EventEmitter<boolean> = new EventEmitter();
  @Output() cookieAgreement: EventEmitter<boolean> = new EventEmitter();

  /**
   * Emits agreement event to parent component
   */
  agree() {
    this.showCookieBanner.emit(false);
    this.cookieAgreement.emit(true);
  }

  decline() {
    this.showCookieBanner.emit(false);
    this.cookieAgreement.emit(false);
  }

}
