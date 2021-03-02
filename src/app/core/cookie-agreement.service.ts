import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieAgreementService {
  cookiesAgreement = false;
  showCookieBanner = true;

  constructor() {}

  getCookieAgreementVal(): boolean {
    this.checkCookieAgreement();
    return this.cookiesAgreement;
  }

  getShowCookieBannerVal(): boolean {
    this.checkShowCookieBanner();
    return this.showCookieBanner;
  }

  /**
   * @Check_Functions
   * checks local storage for value of
   */
  private checkCookieAgreement() {
    const agreement = localStorage.getItem('acceptCookieAgreement');
    this.cookiesAgreement = agreement !== null && agreement === 'true';
  }
  private checkShowCookieBanner() {
    const agreement = localStorage.getItem('showCookieBanner');
    this.showCookieBanner = !(agreement !== null && agreement === 'false');
  }

  /**
   * Stores cookie agreement value in localStorage is used to determine whether user can login
   * @param val the value to store in acceptCookieAgreement (always false before called)
   */
  setCookieAgreement(val: boolean) {
    localStorage.setItem('acceptCookieAgreement', val.toString());
    this.cookiesAgreement = val;
  }

  /**
   * Stores cookie banner value in localStorage and hides banner
   * @param val the value to store in showCookieBanner (always true before called)
   */
  setShowCookieBanner(val: boolean) {
    localStorage.setItem('showCookieBanner', val.toString());
    this.showCookieBanner = val;
  }
}
