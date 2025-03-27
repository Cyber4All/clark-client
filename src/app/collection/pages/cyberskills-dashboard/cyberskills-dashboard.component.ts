import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { AuthValidationService } from '../../../core/auth-module/auth-validation.service';
import { ReportService } from '../../../core/report-module/report.service';
import { ToastrOvenService } from '../../../shared/modules/toaster/notification.service';
import { RatingService } from '../../../core/rating-module/rating.service';
import { SearchService } from '../../../core/learning-object-module/search/search.service';
import { MetricService } from '../../../core/metric-module/metric.service';
import { FilterQuery, OrderBy, SortType } from '../../../interfaces/query';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'clark-cyberskills-dashboard',
  templateUrl: './cyberskills-dashboard.component.html',
  styleUrls: ['./cyberskills-dashboard.component.scss'],
})
export class CyberskillsDashboardComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });

  name = this.authValidationService.getInputFormControl('text');
  learningObjects: any = [];

  filterQuery: FilterQuery = {};
  lastPage: number;
  currPage = 1;
  showCsvModal = false;

  constructor(
    private toaster: ToastrOvenService,
    private view: ViewContainerRef,
    private authValidationService: AuthValidationService,
    private ratingService: RatingService,
    private learningObjectService: SearchService,
    private metricsService: MetricService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.toaster.init(this.view);

    // Do an initial fetch of learning objects with pre-set statuses.
    await this.handlePaginationAndLoadItems(this.currPage, {});
  }

  /**
   * Get metrics for each learning object
   */
  retrieveMetrics() {
    this.learningObjects.forEach(async (lo) => {
      if (lo.status === 'released') {
        lo.metrics = await this.metricsService.getLearningObjectMetrics(
          lo.cuid,
        );
      }
    });
  }

  openCsvGenModal(): void {
    this.showCsvModal = true;
  }

  closeCsvModal(): void {
    this.showCsvModal = false;
  }

  async getRatings(learningObject: any): Promise<any> {
    const { cuid, version } = learningObject;
    return await this.ratingService.getLearningObjectRatings(cuid, version);
  }

  async handlePaginationAndLoadItems(pageNumber, event?: FilterQuery) {
    this.currPage = pageNumber;

    // If a filter query is provided, set it to filterQuery (even if it's empty)
    if (event) {
      this.filterQuery = event;
    }

    console.log(this.filterQuery?.status)

    const objects = (this.learningObjects =
      await this.learningObjectService.getLearningObjects({
        collection: 'cyberskills2work',
        limit: 20,
        status: this.filterQuery?.status?.length
        ? this.filterQuery.status
        : ['released', 'waiting', 'proofing', 'review', 'accepted_major', 'accepted_minor'],
        length: this.filterQuery?.length || [],
        sortType: this.filterQuery?.sortType || SortType.Ascending,
        orderBy: this.filterQuery?.orderBy || OrderBy.Date,
        currPage: this.currPage,
      }));
    this.lastPage = Math.ceil(objects.total / 20); // calc # of pages needed for total learning objects
    this.learningObjects = objects.learningObjects;

    this.retrieveMetrics();
  }
}
