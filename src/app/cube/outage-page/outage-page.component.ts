import { Component, OnInit } from '@angular/core';
import { OutageReport } from './types/outageReport';

@Component({
  selector: 'clark-outage-page',
  templateUrl: './outage-page.component.html',
  styleUrls: ['./outage-page.component.scss']
})
export class OutagePageComponent implements OnInit {

  statusList = ['downloads', 'search'];
  statuses: OutageReport[] = [];
  pastIssues;

  constructor() { }

  ngOnInit() {
  }

  getStatus(name: string) {
    let result: OutageReport;
    this.statuses.forEach(status => {
      if (status.name === name) {
        result = status;
      }
    });
    if (result === undefined) {
      result = {
        name,
        accessGroups: [],
        issues: [],
        discovered: undefined
      };
    }
    return result;
  }

}
