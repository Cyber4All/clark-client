import { Component, OnInit } from '@angular/core';
import { ModalService } from 'app/shared/modules/modals/modal.module';
import { NavbarService } from 'app/core/navbar.service';
import { CookieAgreementService } from 'app/core/cookie-agreement.service';
@Component({
  selector: 'clark-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  constructor(public modalService: ModalService, private nav: NavbarService, private cookieAgreement: CookieAgreementService) {}
  ngOnInit() {
    this.nav.hide();
  }

  acceptsCookieAgreement(val: boolean) {
    this.cookieAgreement.setCookieAgreement(true);
    this.cookieAgreement.setShowCookieBanner(false);
  }

  checkCookieAgreement() {
    return this.cookieAgreement.getCookieAgreementVal();
  }
  cookieBannerVisible() {
    return !localStorage.getItem('acceptCookieAgreement');
  }
}
