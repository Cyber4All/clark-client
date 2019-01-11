import { Component, OnInit, Input } from '@angular/core';
import { UsageStats, PieChart } from '../shared/types';
import { CounterStat } from './counter-block/counter-block.component';

@Component({
  selector: 'cube-usage-stats',
  templateUrl: 'usage-stats.component.html',
  styleUrls: ['usage-stats.component.scss']
})
export class UsageStatsComponent implements OnInit {
  usageStats: UsageStats = {
    objects: {
      released: 95,
      underReview: 705,
      downloads: 1032,
      lengths: {
        nanomodule: 500,
        micromodule: 128,
        module: 89,
        unit: 20,
        course: 12
      },
      outcomes: {
        remember_and_understand: 230,
        apply_and_analyze: 421,
        evaluate_and_synthesize: 78
      }
    },
    users: {
      total: 382,
      organizations: 232
    }
  };

  outcomeDistributionChart: PieChart;

  lengthDistributionChart: PieChart;

  counterStats: CounterStat[] = [];

  constructor() {}

  ngOnInit() {
    this.buildCounterStats();
    this.buildOutcomeDistributionChart();
    this.buildLengthDistributionChart();
  }

  /**
   *
   *
   * @private
   * @memberof UsageStatsComponent
   */
  private buildCounterStats() {
    this.counterStats.push(
      ...[
        {
          title: 'Learning Objects Released',
          value: this.usageStats.objects.released
        },
        {
          title: 'Learning Objects Under Review',
          value: this.usageStats.objects.underReview
        },
        {
          title: 'Learning Objects Downloaded',
          value: this.usageStats.objects.underReview
        },
        {
          title: 'Users',
          value: this.usageStats.users.total
        },
        {
          title: 'Affiliated Organizations',
          value: this.usageStats.users.organizations
        }
      ]
    );
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
      labels: ['Nanomodule', 'Micromodule', 'Module', 'Unit', 'Course'],
      data: [
        this.usageStats.objects.lengths.nanomodule,
        this.usageStats.objects.lengths.micromodule,
        this.usageStats.objects.lengths.module,
        this.usageStats.objects.lengths.unit,
        this.usageStats.objects.lengths.course
      ],
      legend: true,
      options: {
        responsive: true,
        legend: {
          position: 'bottom'
        }
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
        this.usageStats.objects.outcomes.apply_and_analyze,
        this.usageStats.objects.outcomes.remember_and_understand,
        this.usageStats.objects.outcomes.evaluate_and_synthesize
      ],
      legend: true,
      options: {
        responsive: true,
        legend: {
          position: 'bottom'
        }
      },
      colors: [
        {
          backgroundColor: ['#21aba5', '#1d566e', '#163a5f']
        }
      ]
    };
  }
}
