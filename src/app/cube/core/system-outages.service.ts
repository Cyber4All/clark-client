import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { OutageReport } from '../outage-page/types/outageReport';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SystemOutagesService {

  constructor(private http: HttpClient) { }

  getSystemOutages(): WebSocketSubject<OutageReport[]> {
    return webSocket(environment.utilityWebsocket + '/outages');
  }

  getIssues(past?: boolean): Observable<OutageReport[]> {
    return this.http.get<OutageReport[]>(`${environment.apiURL}/outages?pastIssues=${past}`);
  }
}
