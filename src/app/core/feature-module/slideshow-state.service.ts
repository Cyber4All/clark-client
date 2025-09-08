import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SlideshowStateService {
  private readonly storageKey = 'clark.slideshow.enabled';
  private _enabled$ = new BehaviorSubject<boolean>(this.readFromStorage());

  get enabled$(): Observable<boolean> {
    return this._enabled$.asObservable();
  }

  get enabled(): boolean {
    return this._enabled$.getValue();
  }

  setEnabled(flag: boolean): void {
    this._enabled$.next(flag);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(!!flag));
    } catch (_) {
      // ignore storage errors
    }
  }

  toggle(): void {
    this.setEnabled(!this.enabled);
  }

  private readFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) === true : false;
    } catch (_) {
      return false;
    }
  }
}
