import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthValidationService } from '../../core/auth-module/auth-validation.service';
import { ReportService } from '../../core/report-module/report.service';
import { ToastrOvenService } from '../../shared/modules/toaster/notification.service';
import { LearningObjectRatings, RatingService } from '../../core/rating-module/rating.service';
import { SearchService } from '../../core/learning-object-module/search/search.service';
import { MetricService } from '../../core/metric-module/metric.service';
import { FilterQuery, OrderBy, SortType } from '../../interfaces/query';

@Component({
  selector: 'clark-cyberskills-dashboard',
  templateUrl: './cyberskills-dashboard.component.html',
  styleUrls: ['./cyberskills-dashboard.component.scss']
})
export class CyberskillsDashboardComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });
  name = this.authValidationService.getInputFormControl('text');

  learningObjects: any = [];
  filterQuery: FilterQuery = {};

  lastPage=8;
  currPage = 3;
  constructor(
    private toaster: ToastrOvenService,
    private view: ViewContainerRef,
    private authValidationService: AuthValidationService,
    private reportService: ReportService,
    private ratingService: RatingService,
    private learningObjectService: SearchService,
    private metricsService: MetricService
  ) { }

  async ngOnInit(): Promise<void> {
    this.toaster.init(this.view);

    // Do an initial fetch of learning objects with pre-set statuses.
    this.getLearningObjects().then(() => {
      this.retrieveMetrics();
    });
  }

  /**
   * Get a new list of learning objects with filterQuery object data.
   * @param {FilterQuery} event New data from filter pickers.
   */
  async getLearningObjects(event?: FilterQuery) {
    if (event) {
      this.filterQuery = event;
    }

    this.learningObjects =(await this.learningObjectService.getLearningObjects(
      { collection: 'cyberskills2work',
        limit: 20,
        status: this.filterQuery?.status || [],
        length: this.filterQuery?.length || [],
        sortType: this.filterQuery?.sortType || SortType.Ascending,
        orderBy: this.filterQuery?.orderBy || OrderBy.Date
      })).learningObjects;

    this.retrieveMetrics();
  }

  /**
   * Get metrics for each learning object
   */
  retrieveMetrics() {
    this.learningObjects.forEach(async (lo) => {
      if(lo.status === 'released') {
        lo.metrics = await this.metricsService.getLearningObjectMetrics(lo.cuid);
      }
    });
  }

  onDownload(): void {
    if (!this.range.value.start && !this.range.value.end) {
      this.toaster.error('Error!', 'Please enter a date range.');
      return;
    }

    const start = `${this.range.value.start.getFullYear()}-${this.range.value.start.getMonth() + 1}-${this.range.value.start.getDate()}`;
    const end = `${this.range.value.end.getFullYear()}-${this.range.value.end.getMonth() + 1}-${this.range.value.end.getDate()}`;

    this.reportService.generateCollectionReport(['cyberskills2work'], this.name.value, { start: start, end: end });
    this.toaster.alert('We\'re working on it!', 'Please wait while we generate the report.');
  }


  async getRatings(learningObject: any): Promise<any> {
    const { cuid, version } = learningObject;
    return await this.ratingService.getLearningObjectRatings(
      cuid,
      version,
    );
  }

}

