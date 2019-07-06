/**
   * Service that allows components to show or hide the navbar
   */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  visible: boolean;

  constructor() { }

  // hide navbar
  hide() {
    this.visible = false;
  }
  // show navbar
  show() {
    this.visible = true;
  }
  // toggle between visible and hidden
  toggle() {
    this.visible = !this.visible;
  }
}
