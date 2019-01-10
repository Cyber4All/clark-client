import { Component, OnInit, Input } from '@angular/core';
import { UsageStats, Chart, PieChart, DoughnutChart } from './types';

@Component({
  selector: 'cube-usage-stats',
  templateUrl: 'usage-stats.component.html',
  styleUrls: ['usage-stats.component.scss']
})
export class UsageStatsComponent implements OnInit {
  @Input() stats: UsageStats;
  viewAllStats = false;

  outcomeDistributionChart: PieChart;

  lengthDistributionChart: PieChart;

  constructor() {}

  ngOnInit() {
    this.buildOutcomeDistributionChart();
    this.buildLengthDistributionChart();
  }

  /**
   * Constructs chart for Learning Object length distribution
   *
   * @private
   * @memberof UsageStatsComponent
   */
  private buildLengthDistributionChart() {
    this.lengthDistributionChart = {
      title: 'Learning Objects By Length',
      type: 'doughnut',
      labels: ['nanomodule', 'micromodule', 'module', 'unit', 'course'],
      data: [
        this.stats.objects.lengths.nanomodule,
        this.stats.objects.lengths.micromodule,
        this.stats.objects.lengths.module,
        this.stats.objects.lengths.unit,
        this.stats.objects.lengths.course
      ],
      legend: false,
      options: {
        responsive: true
      },
      colors: [
        {
          backgroundColor: [
            '#3b788b',
            '#3b8b80',
            '#3b8b6c',
            '#236b2d',
            '#1e4b25'
          ]
        }
      ]
    };
  }
  /**
   * Constructs chart for Outcome bloom distribution
   *
   * @private
   * @memberof UsageStatsComponent
   */
  private buildOutcomeDistributionChart() {
    this.outcomeDistributionChart = {
      title: 'Outcomes By Bloom',
      type: 'pie',
      labels: [
        'Apply and Analyze',
        'Remember and Understand',
        'Evaluate and Synthesize'
      ],
      data: [
        this.stats.objects.outcomes.apply_and_analyze,
        this.stats.objects.outcomes.remember_and_understand,
        this.stats.objects.outcomes.evaluate_and_synthesize
      ],
      legend: false,
      options: {
        responsive: true
      },
      colors: [
        {
          backgroundColor: ['#21aba5', '#1d566e', '#163a5f']
        }
      ]
    };
  }

  toggleMoreStats() {
    this.viewAllStats = !this.viewAllStats;
  }
}
