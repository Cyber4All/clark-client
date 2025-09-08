import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { LearningObject } from '@entity';
import { FeaturedObjectsService } from 'app/core/feature-module/featured.service';
import { Query } from 'app/interfaces/query';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { SlideshowStateService } from 'app/core/feature-module/slideshow-state.service';
import { UtilityService } from 'app/core/utility-module/utility.service';

@Component({
  selector: 'clark-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss'],
})
export class FeaturedComponent implements OnInit, OnDestroy {
  @ViewChild('list') listElement: ElementRef<HTMLElement>;
  @ViewChild('headers') headersElement: ElementRef<HTMLElement>;

  // Object Arrays
  learningObjects: LearningObject[];
  featuredObjects: LearningObject[];

  // Error states
  // Mutation Errors occurs when the featured array cannot be added to
  mutationError;
  submitError;

  // Search
  searchBarPlaceholder = 'Learning Objects';
  total: number;
  loading: boolean;
  userSearchInput$: Subject<string> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();

  allResultsReceived: boolean;
  isAdminOrEditor: boolean;
  activeCollection: string;

  listViewHeightOffset: number;
  // Query for retrieve
  query: Query = {
    collection: '',
    status: [LearningObject.Status.RELEASED],
    limit: 5,
    currPage: 1,
    text: ''
  };
  lastPage: number;
  destroyed$: Subject<void> = new Subject();

  // Homepage slideshow state
  slideshowEnabled = false;
  private slideshowSub?: any;

  constructor(
    private featureService: FeaturedObjectsService,
    private searchService: SearchService,
    private toaster: ToastrOvenService,
    private slideshowState: SlideshowStateService,
    private utilityService: UtilityService,
  ) {}

  async ngOnInit() {
    setTimeout(() => {
      this.listViewHeightOffset =
        this.listElement.nativeElement.getBoundingClientRect().top +
        this.headersElement.nativeElement.getBoundingClientRect().height;
    });

    this.featureService.featuredObjects.subscribe((objects) => {
      this.featuredObjects = objects;
    });
    await this.featureService.getFeaturedObjects();
    // Subscribe to mutation Error
    this.featureService.mutationError.subscribe((mutationError) => {
      this.mutationError = mutationError;
    });
    // Subscribe to Submit Error
    this.featureService.submitError.subscribe((submitError) => {
      this.submitError = submitError;
    });

    this.getLearningObjects();

    this.slideshowSub = this.slideshowState.enabled$.subscribe((enabled) => {
      this.slideshowEnabled = enabled === true;
    });

    try {
      const enabled = await this.utilityService.getHomepageSlideshowEnabled();
      this.slideshowEnabled = enabled;
      this.slideshowState.setEnabled(enabled);
    } catch (e) {
      // ignore; fallback to local state
    }

    // listen for input events from the search component and perform the search action
    this.userSearchInput$
      .pipe(takeUntil(this.componentDestroyed$), debounceTime(650))
      .subscribe((searchTerm) => {
        this.query = {
          currPage: 1,
          text: searchTerm,
          status: [LearningObject.Status.RELEASED],
          collection: this.activeCollection,
          limit: 5,
        };
        this.learningObjects = [];

        this.getLearningObjects();
      });
  }

  changePage(pageNum) {
    this.query.currPage = pageNum;
    this.getLearningObjects();
  }

  async getLearningObjects() {
    this.validateQuery();
    this.searchService.getLearningObjects(this.query).then((objects) => {
      this.learningObjects = objects.learningObjects;
      this.lastPage = Math.ceil(objects.total / 5);
    });
  }

  validateQuery(){
    if(!this.query.collection){
      this.query.collection = '';
    }
    if(!this.query.start){
      delete this.query.start;
    }
    if(!this.query.end){
      delete this.query.end;
    }
    if(!this.query.startNextCheck){
      delete this.query.startNextCheck;
    }
    if(!this.query.endNextCheck){
      delete this.query.endNextCheck;
    }
  }

  /**
   * Update the Query's collection parameter and reset the Learning Objects query
   *
   * @param {string} collection the abbreviated name of the collection by which to filter
   * @memberof LearningObjectsComponent
   */
  getCollectionFilteredLearningObjects(collection: string) {
    this.activeCollection = collection;
    this.learningObjects = [];
    this.getLearningObjects();
  }

  getFilteredLearningObjects(filters: any) {
    this.query.topics = filters.topic;
    this.query.collection = filters.collection;
    this.query.start = filters.start;
    this.query.end = filters.end;
    this.query.currPage = filters.currPage;
    this.learningObjects = [];

    this.getLearningObjects();
  }

  /**
   * Clears all filters and resets the Learning Objects query
   *
   * @memberof LearningObjectsComponent
   */
  clearFilters() {
    this.query.collection = '';
    this.query.currPage = 1;
    this.query.topics = [];
    this.learningObjects = [];

    this.getLearningObjects();
  }

  removeFeatured(object) {
    this.featureService.removeFeaturedObject(object);
    this.getLearningObjects();
  }
  async saveFeatured() {
    this.featureService.saveFeaturedObjects().then(
      () => {
        this.toaster.success('Success!', 'Featured learning objects updated!');
      },
      (error) => {
        this.toaster.error(
          'Error!',
          'Unable to update Featured learning objects.',
        );
      },
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      if (this.featuredObjects.length < 5) {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );
      }
    }
    console.log("DROPPING")
    console.log(this.featuredObjects)
    this.featureService.setFeatured(this.featuredObjects);
    this.getLearningObjects();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
    if (this.slideshowSub && typeof this.slideshowSub.unsubscribe === 'function') {
      this.slideshowSub.unsubscribe();
      this.slideshowSub = undefined;
    }
  }

  async onSlideshowToggled(state: boolean) {
    this.slideshowState.setEnabled(state);
    try {
      await this.utilityService.setHomepageSlideshowEnabled(state);
    } catch (e) {
      this.toaster.error('Error', 'Failed to save slideshow setting');
    }
  }
}
