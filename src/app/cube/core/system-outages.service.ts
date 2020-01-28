import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class SystemOutagesService {

  constructor() { }

  getSystemOutages(): WebSocketSubject<any> {
    return webSocket(environment.utilityWebsocket + '/outages');
  }
}
