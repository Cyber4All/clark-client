import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BlogsComponentService {
  neverShowBanner = false;
  showBanner = true;

  constructor() { }

  getShowBanner(): boolean {
    return this.showBanner;
  }

  getNeverShowBanner(): boolean {
    this.updateNeverShowBanner();
    return this.neverShowBanner;
  }

  private updateNeverShowBanner() {
    const status = localStorage.getItem('neverShowBanner');
    this.neverShowBanner = status === 'true';
  }

  setShowBanner(val: boolean) {
    this.showBanner = val;
  }

  setNeverShowBanner(val: boolean) {
    localStorage.setItem('neverShowBanner', val.toString());
    this.neverShowBanner = val;
  }
}
