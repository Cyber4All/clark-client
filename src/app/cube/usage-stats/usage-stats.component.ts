import { Component, OnInit } from '@angular/core';
import { UsageStats, PieChart } from '../shared/types';
import { CounterStat } from './counter-block/counter-block.component';

// This variable is used to decided whether or not percentages should be rendered.
// If CHART_HOVERED, tooltips are visible and we do not want to render percentages over tooltips
let CHART_HOVERED = false;
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
  outcomeLearnMoreLink = 'http://about.clark.center/tutorial/#Uploading';

  lengthDistributionChart: PieChart;
  lengthLearnMoreLink = 'http://about.clark.center/tutorial/#Uploading';

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
          title: 'Users',
          value: this.usageStats.users.total
        },
        {
          title: 'Affiliated Organizations',
          value: this.usageStats.users.organizations
        },
        {
          title: 'Learning Objects Downloaded',
          value: this.usageStats.objects.underReview
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
        },
        hover: {
          onHover: () => {
            CHART_HOVERED = true;
          }
        },
        animation: {
          onComplete: generatePieSliceLabels
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
        },
        hover: {
          onHover: () => {
            CHART_HOVERED = true;
          }
        },
        // @ts-ignore
        animation: {
          onComplete: generatePieSliceLabels
        }
      },
      colors: [
        {
          backgroundColor: ['#21aba5', '#1d566e', '#163a5f']
        }
      ]
    };
  }

  /**
   * Sets CHART_HOVERED to true
   *
   * @memberof UsageStatsComponent
   */
  handleChartNotHovered() {
    CHART_HOVERED = false;
  }
}

/**
 * Renders percentages on pie slices
 *
 */
function generatePieSliceLabels() {
  const ctx = this.chart.ctx;
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  // If user is not hovering over chart (meaning tooltips are visible), render percentage slices
  if (!CHART_HOVERED) {
    this.data.datasets.forEach(function(dataset) {
      // Sum of data values
      const total = dataset._meta[Object.keys(dataset._meta)[0]].total;
      for (let i = 0; i < dataset.data.length; i++) {
        // Info about Pie Slice
        const model =
          dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
        // Calc midpoint of radius
        const mid_radius =
          model.innerRadius + (model.outerRadius - model.innerRadius) / 2;
        const start_angle = model.startAngle;
        const end_angle = model.endAngle;
        // Calc midpoint of angle
        const mid_angle = start_angle + (end_angle - start_angle) / 2;
        // Calc x coordinate of angle midpoint
        const x = mid_radius * Math.cos(mid_angle);
        // Calc y coordinate of angle midpoint
        const y = mid_radius * Math.sin(mid_angle);

        ctx.fillStyle = '#fff';
        const percent = Math.round((dataset.data[i] / total) * 100);
        // Don't Display If value is zero or percent is less than 10
        if (dataset.data[i] !== 0 && percent >= 10) {
          // Display percentage
          ctx.fillText(`${percent}%`, model.x + x, model.y + y);
        }
      }
    });
  }
}
