import { Injectable } from '@angular/core';

/**
 * @class 'SubscriptionAgreementService' is a component used to toggle the
 * CLARK Newsletter Banner. This class is only used within @module CubeModule
 * This class can be expanded upon; however, this class only pertains to the
 * general user subscriptions with their email; NOT collection subscriptions.
 */

@Injectable({
  providedIn: 'root'
})
export class SubscriptionAgreementService {
  showSubscriptionBanner = true;
  isMobile = window.screen.width < 600 ? true : false;

  constructor() {}

  /**
   * Function that retrieves the toggle value for the subscription banner
   *
   * @returns current value of 'showSubscriptionBanner'
   */
  getShowSubscriptionBannerVal(): boolean {
    this.checkShowSubscriptionBanner();
    return this.showSubscriptionBanner;
  }

  /**
   * @private Function to initialize local storage variable for the subscription banner
   *
   * @const banner checks local storage for 'showSubscriptionBanner'
   * If null: intialize it^ @function setShowSubscriptionBanner(true)
   */
  private checkShowSubscriptionBanner() {
    const banner = localStorage.getItem('showSubscriptionBanner');
    if (banner == null) {
      this.setShowSubscriptionBanner(true);
    } else if (banner && this.isMobile) {
      this.setShowSubscriptionBanner(false);
    }
    this.showSubscriptionBanner = !(banner !== null && banner === 'false');
  }

  /**
   * Function to toggle on and off the subscription banner
   *
   * @param val boolean toggle: when true banner shows
   */
  setShowSubscriptionBanner(val: boolean) {
    localStorage.setItem('showSubscriptionBanner', val.toString());
    this.showSubscriptionBanner = val;
  }
}
