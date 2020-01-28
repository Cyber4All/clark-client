import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { OutageReport } from '../outage-page/types/outageReport';

@Injectable({
  providedIn: 'root'
})
export class SystemOutagesService {

  constructor() { }

  getSystemOutages(): WebSocketSubject<OutageReport[]> {
    return webSocket(environment.utilityWebsocket + '/outages');
  }
}
