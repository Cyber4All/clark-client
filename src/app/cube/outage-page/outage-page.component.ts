import { Component, OnInit, OnDestroy } from '@angular/core';
import { OutageReport } from './types/outageReport';
import { SystemOutagesService } from '../core/system-outages.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-outage-page',
  templateUrl: './outage-page.component.html',
  styleUrls: ['./outage-page.component.scss']
})
export class OutagePageComponent implements OnInit, OnDestroy {
  destroyed$: Subject<void> = new Subject();

  statusList = ['downloads', 'search'];
  statuses: OutageReport[] = [];
  pastIssues: OutageReport[];

  constructor(private systemOutagesService: SystemOutagesService) { }

  ngOnInit() {
    this.systemOutagesService.getSystemOutages().pipe(takeUntil(this.destroyed$)).subscribe((outages) => {
      this.statuses = outages;
    });

    this.systemOutagesService.getIssues(true).pipe(takeUntil(this.destroyed$)).subscribe((outages) => {
      this.pastIssues = outages;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
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
