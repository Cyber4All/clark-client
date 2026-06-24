import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
    selector: 'cube-distribution-chart',
    templateUrl: 'distribution-chart.component.html',
    styleUrls: ['distribution-chart.component.scss'],
    standalone: true,
    imports: [NgIf, NgChartsModule],
})
export class DistributionChartComponent implements OnInit {
  @Input() chart: any;
  @Input() moreInfoLink: string;
  @Output() chartNotHovered: EventEmitter<void> = new EventEmitter<void>();
  @Input() ariaLabel: string;

  constructor() {}

  ngOnInit() {}
  handleMouseleave() {
    this.chartNotHovered.emit();
  }
}
