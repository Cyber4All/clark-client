import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'clark-outage-page',
  templateUrl: './outage-page.component.html',
  styleUrls: ['./outage-page.component.scss']
})
export class OutagePageComponent implements OnInit {

  statusList = ['downloads', 'search'];
  statuses = [];

  constructor() { }

  ngOnInit() {
  }

  getStatus(name: string) {
    let result;
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
