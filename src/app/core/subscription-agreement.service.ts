import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionAgreementService {
  showSubscriptionBanner = true;

  constructor() {}

  // Service call to return current value of subscription banner toggle
  getShowSubscriptionBannerVal(): boolean {
    this.checkShowSubscriptionBanner();
    return this.showSubscriptionBanner;
  }

  // private service function to check/initialize local subscription variable
  private checkShowSubscriptionBanner() {
    const banner = localStorage.getItem('showSubscriptionBanner');
    if (banner == null) {
      this.setShowSubscriptionBanner(true);
    }
    this.showSubscriptionBanner = !(banner !== null && banner === 'false');
  }

  // Function to update the subscription banner
  setShowSubscriptionBanner(val: boolean) {
    localStorage.setItem('showSubscriptionBanner', val.toString());
    this.showSubscriptionBanner = val;
  }
}
