import { Component, OnInit, Input } from '@angular/core';
import { UsageStats } from 'app/cube/shared/types';

@Component({
  selector: 'cube-stat-counters',
  templateUrl: 'stat-counters.component.html',
  styleUrls: ['stat-counters.component.scss']
})
export class StatCountersComponent implements OnInit {
  @Input() stats: UsageStats;
  constructor() {}

  ngOnInit() {}
}
