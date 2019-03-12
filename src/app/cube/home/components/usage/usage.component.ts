import { Component, OnInit, Input } from '@angular/core';
import { UsageStats } from 'app/cube/shared/types/usage-stats';

@Component({
  selector: 'clark-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss']
})
export class UsageComponent implements OnInit {

  @Input() stats: UsageStats;
  @Input() objectStatsLoading: boolean;
  @Input() userStatsLoading: boolean;

  constructor() { }

  ngOnInit() {
  }

}
