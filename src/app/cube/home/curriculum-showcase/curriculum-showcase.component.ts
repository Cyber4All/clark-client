import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeaturedObjectsService } from 'app/core/feature-module/featured.service';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { Query, OrderBy, SortType } from '../../../interfaces/query';

@Component({
  selector: 'clark-curriculum-showcase',
  templateUrl: './curriculum-showcase.component.html',
  styleUrls: ['./curriculum-showcase.component.scss']
})
export class CurriculumShowcaseComponent implements OnInit, OnDestroy {
  learningObjects: LearningObject[] = [];
  loading = true;
  destroyed$ = new Subject<void>();

  // Sample stats - these would normally come from a service
  totalLearningObjects = 2500;
  totalEducators = 400;
  totalInstitutions = 150;
  totalDownloads = 25000;

  private query: Query = {
    limit: 4,
    orderBy: OrderBy.Date,
    sortType: SortType.Descending,
    status: [LearningObject.Status.RELEASED]
  };

  constructor(
    private featuredService: FeaturedObjectsService,
    private searchService: SearchService
  ) {
    // Initialize with placeholder objects for loading state
    this.learningObjects = Array(4).fill(new LearningObject());
  }

  ngOnInit() {
    this.loadFeaturedCurriculum();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private async loadFeaturedCurriculum() {
    try {
      this.loading = true;

      // Try to get featured objects first
      this.featuredService.getFeaturedObjects();
      this.featuredService.featuredObjects
        .pipe(takeUntil(this.destroyed$))
        .subscribe(objects => {
          if (objects && objects.length > 0) {
            this.learningObjects = objects.slice(0, 4);
            this.loading = false;
          } else {
            // Fallback to recent objects if no featured objects
            this.loadRecentCurriculum();
          }
        });
    } catch (error) {
      console.warn('Error loading featured curriculum:', error);
      this.loadRecentCurriculum();
    }
  }

  private async loadRecentCurriculum() {
    try {
      const result = await this.searchService.getLearningObjects(this.query);
      this.learningObjects = result.learningObjects.slice(0, 4);
      this.loading = false;
    } catch (error) {
      console.warn('Error loading recent curriculum:', error);
      this.learningObjects = [];
      this.loading = false;
    }
  }
}
