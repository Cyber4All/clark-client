import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service that allows components to show or hide the navbar
 */
@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  visible = true;
  _query$ = new BehaviorSubject<boolean>(false);

  get query(): BehaviorSubject<boolean> {
    return this._query$;
  }

  set query(val: BehaviorSubject<boolean>) {
    this._query$ = val;
  }

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
