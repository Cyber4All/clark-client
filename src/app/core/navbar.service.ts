/**
   * Service that allows components to show or hide the navbar
   */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  visible: boolean;

  constructor() {
    this.visible = true;
  } // navbar is visible by default

  // hide navbar
  hide() {
    // setTimeout(() => (this.visible = false), 1);
    this.visible = false;
  }
  // show navbar
  show() {
    // setTimeout(() => (this.visible = true), 1);
    this.visible = true;
  }
  // toggle between visible and hidden
  toggle() {
    // setTimeout(() => (this.visible = !this.visible), 1);
    this.visible = !this.visible;
  }
}
