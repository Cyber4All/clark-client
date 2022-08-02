import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service that allows components to show or hide the navbar
 */
@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  visible = true;
  _query$ = new BehaviorSubject<boolean>(false);
  level = new BehaviorSubject<string>('all academic levels');

  get query(): BehaviorSubject<boolean> {
    return this._query$;
  }

  set query(val: BehaviorSubject<boolean>) {
    this._query$ = val;
  }

  setLevel(val) {
    this.level.next(val);
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
