import { Injectable } from '@angular/core';

/* eslint-disable @typescript-eslint/naming-convention */
// Google Analytics
let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleTagService {

  constructor() { }

  /**
   * Send the browse_learning_objects event to Google Analytics
   */
   triggerGoogleTagEvent(event: string, category: string, label: string) {
    gtag('event', event, {
      event_category: category,
      event_label: label,
    });
  }
}
