import { Injectable } from '@angular/core';

/* eslint-disable @typescript-eslint/naming-convention */
declare global {
  interface Window {
    gtag: Function;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleTagService {

  constructor() { }

  /**
   * Send the browse_learning_objects event to Google Analytics
   */
   triggerGoogleTagEvent(event: string, category: string, label: string) {
    // Check if gtag is available before calling it
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        event_category: category,
        event_label: label,
      });
    } else {
      console.warn('Google Analytics gtag function is not available');
    }
  }
}
