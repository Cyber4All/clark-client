import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserAgentService {

  isWindows: boolean;

  constructor() {
    this.isWindows = (navigator.appVersion.indexOf('Win') !== -1);
  }
}
