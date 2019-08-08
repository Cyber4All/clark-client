import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PieChart, DoughnutChart } from '../types';

@Component({
  selector: 'cube-distribution-chart',
  templateUrl: 'distribution-chart.component.html',
  styleUrls: ['distribution-chart.component.scss']
})
export class DistributionChartComponent implements OnInit {
  @Input() chart: PieChart | DoughnutChart;
  @Input() moreInfoLink: string;
  @Output() chartNotHovered: EventEmitter<void> = new EventEmitter<void>();
  @Input() ariaLabel: string;

  constructor() {}

  ngOnInit() {}
  handleMouseleave() {
    this.chartNotHovered.emit();
  }
}
