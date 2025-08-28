import { Component, Input, OnInit } from '@angular/core';
import { LearningObjectService } from 'app/core/learning-object-module/learning-object/learning-object.service';
import { MetricService } from 'app/core/metric-module/metric.service';
import { PieChart } from 'app/cube/usage-stats/types/chart';
import { TagsService } from 'app/core/learning-object-module/tags/tags.service';

// This variable is used to decided whether or not percentages should be rendered.
// If CHART_HOVERED, tooltips are visible and we do not want to render percentages over tooltips
let CHART_HOVERED = false;
@Component({
  selector: 'clark-dashboard-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
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

  lengthDistributionChart: PieChart;

  lengthDistributionReady = false;

  constructor(
    private metricService: MetricService,
    private learningObjectService: LearningObjectService,
    private tagsService: TagsService
  ) { }

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

    await this.metricService.getCollectionMetrics(this.collectionName).then(async (res: any) => {
      this.objDownload = res.downloads;
      this.objSaved = res.saves;
      this.objReleased = res.statusMetrics[0].released;
      const num = res.statusMetrics[0].waiting + res.statusMetrics[0].peerReview + res.statusMetrics[0].proofing;
      this.objReview = num;
      this.authorCollection = res.authors.length;
      stats = res;
    });
    await this.buildLengthDistributionChart(stats);
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
    this.lengthDistributionChart = {
      title: 'Learning Objects By Length',
      type: 'doughnut',
      labels: ['Nanomodule', 'Micromodule', 'Module', 'Unit', 'Course'],
      data: [
        stats.lengthMetrics.nanomodules,
        stats.lengthMetrics.micromodules,
        stats.lengthMetrics.modules,
        stats.lengthMetrics.units,
        stats.lengthMetrics.courses,
      ],
      legend: true,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          position: 'bottom',
        },
        hover: {
          onHover: () => {
            CHART_HOVERED = true;
          },
        },
        animation: {
          onComplete: generatePieSliceLabels,
        },
      },
      colors: [
        {
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
    this.lengthDistributionReady = true;
  }

  handleChartNotHovered() {
    CHART_HOVERED = false;
  }

   async getStatsForTag(tag: string) {
      if (!tag) return;
      const tagMetrics = await this.metricService.getTagMetrics(tag);
      this.objReleased = tagMetrics.releasedLearningObjects;
      this.objDownload = tagMetrics.downloads;
      this.authorCollection = tagMetrics.authors.length;
  }

    async getTagIdByName(name: string) {
        return await this.tagsService.getTagIdByName(name);
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
          const midRadius =
            model.innerRadius + (model.outerRadius - model.innerRadius) / 2;
          const startAngle = model.startAngle;
          const endAngle = model.endAngle;
          // Calc midpoint of angle
          const midAngle = startAngle + (endAngle - startAngle) / 2;
          // Calc x coordinate of angle midpoint
          const x = midRadius * Math.cos(midAngle);
          // Calc y coordinate of angle midpoint
          const y = midRadius * Math.sin(midAngle);

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


