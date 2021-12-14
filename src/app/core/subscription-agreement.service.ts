import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionAgreementService {
  showSubscriptionBanner = true;

  constructor() {}

  /**
   * Function that toggles the value for the subscription banner
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
