import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'clark-cookies',
    templateUrl: './cookies.component.html',
    styleUrls: ['./cookies.component.scss'],
    standalone: true,
    imports: [RouterLink]
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
