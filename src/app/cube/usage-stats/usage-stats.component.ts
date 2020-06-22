import { Component, OnInit } from '@angular/core';
import { UsageStats, LearningObjectStats, UserStats } from '../shared/types/usage-stats';
import { CounterStat } from './counter-block/counter-block.component';
import { PieChart } from './types';
import { UsageStatsService } from '../core/usage-stats/usage-stats.service';
import { LearningObject } from '@entity';
import { LearningObjectService } from '../learning-object.service';

// This variable is used to decided whether or not percentages should be rendered.
// If CHART_HOVERED, tooltips are visible and we do not want to render percentages over tooltips
let CHART_HOVERED = false;
@Component({
  selector: 'cube-usage-stats',
  templateUrl: 'usage-stats.component.html',
  styleUrls: ['usage-stats.component.scss']
})
export class UsageStatsComponent implements OnInit {
  outcomeDistributionReady = false;
  lengthDistributionReady = false;
  organizationDistributionReady = false;

  // Default values are set to -1 (invalid value) to trigger loading spinner
  usageStats: UsageStats = {
    objects: {
      released: -1,
      review: -1,
      downloads: -1,
      collections: { number: -1 },
      topDownloads: [],
      lengths: {
        nanomodule: -1,
        micromodule: -1,
        module: -1,
        unit: -1,
        course: -1
      },
      outcomes: {
        remember_and_understand: -1,
        apply_and_analyze: -1,
        evaluate_and_synthesize: -1
      }
    },
    users: {
      accounts: -1,
      organizations: -1
    }
  };

  learningObjects: LearningObject[] = [];
  organizationBreakdownChart: PieChart;

  outcomeDistributionChart: PieChart;
  outcomeLearnMoreLink = 'https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy';

  lengthDistributionChart: PieChart;
  lengthLearnMoreLink = 'http://about.clark.center/tutorial/#Uploading';

  counterStats: CounterStat[] = [];

  objectStats: LearningObjectStats;
  userStats: UserStats;

  outcomeDistributionChartAria: string;
  organizationBreakdownChartAria: string;
  lengthDistributionChartAria: string;
  lengthBreakdownChartAria: string;
  lengthBreakdownChart: any;

  constructor(private statsService: UsageStatsService, private learningObjectService: LearningObjectService) {}

  ngOnInit() {
    this.buildOrganizationBreakdownChart();
    this.buildCounterStats();
    this.statsService.getLearningObjectStats().then(stats => {
      this.usageStats.objects.released = stats.released;
      this.usageStats.objects.review = stats.review;
      this.usageStats.objects.downloads = stats.downloads;
      this.usageStats.objects.collections = stats.collections;
      this.usageStats.objects.topDownloads = stats.topDownloads;
      this.usageStats.objects.lengths = {
        nanomodule: stats.lengths.nanomodule,
        micromodule: stats.lengths.micromodule,
        module: stats.lengths.module,
        unit: stats.lengths.unit,
        course: stats.lengths.course
      };

      this.usageStats.objects.outcomes = stats.outcomes;

      this.buildCounterStats();
      this.buildOutcomeDistributionChart();
      this.buildLengthDistributionChart();
      this.buildTopDownloads();
    });

    this.statsService.getUserStats().then(stats => {
      this.usageStats.users.accounts = stats.accounts;
      this.usageStats.users.organizations = stats.organizations;
      this.buildCounterStats();
    });
  }

  /**
   * Adds CounterStat for (Learning Objects Released, Learning Objects Under Review, Users, Affiliated Organizations, and Downloads)
   * to array of counter stats
   *
   * @private
   * @memberof UsageStatsComponent
   */
  private buildCounterStats() {
    // Empty the array to avoid pushing duplicates
    this.counterStats = [
        {
          title: 'Released Learning Objects',
          value: this.usageStats.objects.released,
          class: 'released',
        },
        {
          title: 'Learning Objects Under Review',
          value: this.usageStats.objects.review,
          class: 'review',
        },
        {
          title: 'Quality-Assured Collections',
          value: this.usageStats.objects.collections.number,
          class: 'collections',
        },
        {
          title: 'Downloads',
          value: this.usageStats.objects.downloads,
          class: 'downloads',
        },
        {
          title: 'Users',
          value: this.usageStats.users.accounts,
          class: 'users'
        },
        {
          title: 'Affiliated Organizations',
          value: this.usageStats.users.organizations,
          class: 'organizations',
        }
      ];
  }

  /**
   * Constructs chart for Organization Breakdown distribution
   * FIXME: Data is currently hardcoded in this chart and should be eventually pulled from backend.
   *
   * @private
   * @memberof UsageStatsComponent
   */
  private buildOrganizationBreakdownChart() {
    this.organizationBreakdownChart = {
      title: 'Users By Organization',
      type: 'doughnut',
      labels: ['Universities', 'Community Colleges', 'K-12 (Schools)', 'Companies', 'Government'],
      data: [
        248,
        24,
        30,
        79,
        22
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
    /**
     * This for loop is creating the aria-label for the chart. It is creating a string from the labels and data points
     * in the organizaitonBreakdownChart object. The string would look like
     * 'Universities 200, Community Colleges 304, K-12 (Schools) 404, Companies 800, Government 304'
     */
    this.organizationBreakdownChartAria = this.organizationBreakdownChart.labels[1] + ' ' + this.organizationBreakdownChart.data[1] + ', ';
    let i: number;
    for (i = 1; i < this.organizationBreakdownChart.labels.length; i++) {
      this.organizationBreakdownChartAria =
      this.organizationBreakdownChartAria +
      this.organizationBreakdownChart.labels[i] +
      ' ' + this.organizationBreakdownChart.data[i] + ', ';
    }
    this.organizationDistributionReady = true;
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
      ],
    };
    /**
     * This for loop is creating the aria-label for the chart. It is creating a string from the labels and data points
     * in the lengthDistributionChart object. The string would look like
     * 'Nanomodule 200, Micromodule 304, Module 404, Unit 426, Course 4000'
     */
    this.lengthBreakdownChartAria = this.lengthDistributionChart.labels[0] + ' ' + this.lengthDistributionChart.data[0] + ', ';
    let i: number;
    for (i = 1; i < this.lengthDistributionChart.labels.length; i++) {
      this.lengthBreakdownChartAria =
      this.lengthBreakdownChartAria +
      this.lengthDistributionChart.labels[i] +
      ' ' + this.lengthDistributionChart.data[i] + ', ';
    }
    this.lengthDistributionReady = true;
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
          backgroundColor: ['#5ec9da', '#f5a623', '#bd5eda']
        }
      ]
    };
    /**
     * This for loop is creating the aria-label for the chart. It is creating a string from the labels and data points
     * in the outcomeDistributionChart object. The string would look like
     * 'Apply and Analyze 200, Remember and Understand 304, Evaluate and Synthesize 404'
     */
    this.outcomeDistributionChartAria = this.outcomeDistributionChart.labels[0] + ' ' + this.outcomeDistributionChart.data[0] + ', ';
    let i: number;
    for (i = 1; i < this.outcomeDistributionChart.labels.length; i++) {
      this.outcomeDistributionChartAria =
      this.outcomeDistributionChartAria +
      this.outcomeDistributionChart.labels[i] +
      ' ' + this.outcomeDistributionChart.data[i] + ', ';
    }
    this.outcomeDistributionReady = true;
  }

  /**
   * Builds the top downloads list based on information coming back from
   * Library Service
   */
  private async buildTopDownloads() {
    for (let i = 0; i < this.usageStats.objects.topDownloads.length; i++) {
      const cuid = this.usageStats.objects.topDownloads[i].learningObjectCuid;
      // This will need to be fixed once we add logic to learning object service to verify the author. As of right now
      // learning object service will return a learning object as long as the learningObject cuid is found.
      const object = await this.learningObjectService.getLearningObject('clark', cuid);
      object.metrics.downloads = this.usageStats.objects.topDownloads[i].downloads;
      this.learningObjects.push(object);
    }
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
