import { Component, OnInit, OnDestroy } from '@angular/core';
import { OutageReport } from './types/outageReport';
import { SystemOutagesService } from '../core/system-outages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'clark-outage-page',
  templateUrl: './outage-page.component.html',
  styleUrls: ['./outage-page.component.scss']
})
export class OutagePageComponent implements OnInit, OnDestroy {

  statusList = ['downloads', 'search'];
  statuses: OutageReport[] = [];
  pastIssues: OutageReport[];

  subscription: Subscription;

  constructor(private systemOutagesService: SystemOutagesService) { }

  ngOnInit() {
    this.subscription = this.systemOutagesService.getSystemOutages().subscribe((outages) => {
      this.statuses = outages;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
