import { Component, OnInit, Input } from '@angular/core';
import { OutageReport } from '../types/outageReport';

@Component({
  selector: 'clark-outage-card',
  templateUrl: './outage-card.component.html',
  styleUrls: ['./outage-card.component.scss']
})
export class OutageCardComponent implements OnInit {

  @Input() status: OutageReport;
  icon: string;

  constructor() { }

  ngOnInit() {
    switch (this.status.name) {
      case 'search':
        this.icon = 'fas fa-search';
        break;
      case 'downloads':
        this.icon = 'fas fa-download';
        break;
    }
  }

}
