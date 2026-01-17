import { Component, Input, OnInit } from '@angular/core';
import { LearningObjectService } from 'app/core/learning-object-module/learning-object/learning-object.service';
import { MetricService } from 'app/core/metric-module/metric.service';
import { TagsService } from 'app/core/learning-object-module/tags/tags.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';

// This variable is used to decided whether or not percentages should be rendered.
// If CHART_HOVERED, tooltips are visible and we do not want to render percentages over tooltips
let CHART_HOVERED = false;
@Component({
  selector: 'clark-dashboard-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent implements OnInit {
  @Input() collectionName: string;
  @Input() displayCharts: boolean;
  tagId: string;
  name: string;

  objDownload: number;
  objReview: number;
  objReleased: number;
  objSaved: number;
  authorCollection: number;

  learningObjects: any = [];
  loading: Boolean = false;

  lengthDistributionChart: any;

  lengthDistributionReady = false;

  constructor(
    private metricService: MetricService,
    private learningObjectService: LearningObjectService,
    private tagsService: TagsService,
  ) {}

  async ngOnInit() {
    switch (this.collectionName) {
      case 'xpcyber':
        this.name = 'XP Cyber';
        break;
      case 'ncyte':
        this.name = 'NCyTE';
        break;
      case 'cyberskills2work':
        this.name = 'CyberSkills2Work';
        break;
      case 'withcyber':
        this.tagId = await this.getTagIdByName('WITHcyber');
        await this.getStatsForTag(this.tagId);
        return;
    }
    let stats = {};

    await this.metricService
      .getCollectionMetrics(this.collectionName)
      .then(async (res: any) => {
        this.objDownload = res.downloads;
        this.objSaved = res.saves;
        this.objReleased = res.statusMetrics[0].released;
        const num =
          res.statusMetrics[0].waiting +
          res.statusMetrics[0].peerReview +
          res.statusMetrics[0].proofing;
        this.objReview = num;
        this.authorCollection = res.authors.length;
        stats = res;
      });
    this.buildLengthDistributionChart(stats);
    await this.buildTopDownloads(stats);
  }

  /**
   * Builds the top downloads list based on information coming back from
   * Library Service
   */
  private async buildTopDownloads(stats: any) {
    this.loading = true;
    for (let i = 0; i < stats.top5Downloads.length; i++) {
      const cuid = stats.top5Downloads[i].cuid;
      // This will need to be fixed once we add logic to learning object service to verify the author. As of right now
      // learning object service will return a released learning object as long as the learningObject cuid is found.
      const object = await this.learningObjectService.getLearningObject(cuid);
      object.metrics.downloads = stats.top5Downloads[i].downloads;
      this.learningObjects.push(object);
    }
    this.loading = false;
  }

  /**
   * Constructs chart for Learning Object length distribution
   *
   * @private
   * @memberof UsageStatsComponent
   */
  private buildLengthDistributionChart(stats: any) {
    const data: ChartConfiguration<'doughnut'>['data'] = {
      labels: ['Nanomodule', 'Micromodule', 'Module', 'Unit', 'Course'],
      datasets: [
        {
          label: '',
          data: [
            stats.lengthMetrics.nanomodules,
            stats.lengthMetrics.micromodules,
            stats.lengthMetrics.modules,
            stats.lengthMetrics.units,
            stats.lengthMetrics.courses,
          ],
          backgroundColor: [
            '#3b788b',
            '#3b8b80',
            '#3b8b6c',
            '#236b2d',
            '#1e4b25',
          ],
        },
      ],
    };

    const options: ChartOptions<'doughnut'> = {
      responsive: true,
    };

    this.lengthDistributionChart = {
      title: 'Learning Objects By Length',
      type: 'doughnut',
      data: data,
      legend: true,
      options: options,
    };
    this.lengthDistributionReady = true;
  }

  handleChartNotHovered() {
    CHART_HOVERED = false;
  }

  async getStatsForTag(tag: string) {
    if (!tag) {
      return;
    }
    const tagMetrics = await this.metricService.getTagMetrics(tag);
    this.objReleased = tagMetrics.releasedLearningObjects;
    this.objDownload = tagMetrics.downloads;
    this.authorCollection = tagMetrics.authors.length;
  }

  async getTagIdByName(name: string) {
    return await this.tagsService.getTagIdByName(name);
  }
}
