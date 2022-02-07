import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { Query } from 'app/interfaces/query';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

@Component({
  selector: 'clark-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss'],
  providers: [LearningObjectService]
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
    collection: undefined,
    status: [LearningObject.Status.RELEASED],
    limit: 5,
    currPage: 1,
    text: '',
  };
  lastPage: number;
  destroyed$: Subject<void> = new Subject();

  constructor(
    private featureService: FeaturedObjectsService,
    public toaster: ToastrOvenService,
  ) { }

  async ngOnInit() {
    setTimeout(() => {
      this.listViewHeightOffset =
        this.listElement.nativeElement.getBoundingClientRect().top +
        this.headersElement.nativeElement.getBoundingClientRect().height;
    });

    this.featureService.featuredObjects.subscribe(objects => {
      this.featuredObjects = objects;
    });
    await this.featureService.getFeaturedObjects();
    // Subscribe to mutation Error
    this.featureService.mutationError.subscribe(mutationError => {
      this.mutationError = mutationError;
    });
    // Subscribe to Submit Error
    this.featureService.submitError.subscribe(submitError => {
      this.submitError = submitError;
    });

    this.getLearningObjects();
    // listen for input events from the search component and perform the search action
    this.userSearchInput$
      .pipe(
        takeUntil(this.componentDestroyed$),
        debounceTime(650)
      )
      .subscribe(searchTerm => {
        this.query = {
          currPage: 1,
          text: searchTerm,
          status: [LearningObject.Status.RELEASED],
          collection: this.activeCollection,
          limit: 5
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
    this.featureService.getNotFeaturedLearningObjects(this.query).then(objects => {
      this.learningObjects = objects.learningObjects;
      this.lastPage = Math.ceil(objects.total / 5);
    });
  }

  /**
   * Update the Query's collection parameter and reset the Learning Objects query
   *
   * @param {string} collection the abbreviated name of the collection by which to filter
   * @memberof LearningObjectsComponent
   */
  getCollectionFilteredLearningObjects(collection: string) {
    this.activeCollection = collection;
    this.query = { collection, currPage: 1, status: [LearningObject.Status.RELEASED]};
    this.learningObjects = [];

    this.getLearningObjects();
  }

   /**
    * Clear the filters of both collection and status and reset the Learning Objects query
    *
    * @memberof LearningObjectsComponent
    */
  clearCollectionFilters() {
    this.query = { collection: undefined, currPage: 1 };
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
      error => {
        this.toaster.error('Error!', 'Unable to update Featured learning objects.');
      }
    );
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (this.featuredObjects.length < 5) {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
      }
    }
    this.featureService.setFeatured(this.featuredObjects);
    this.getLearningObjects();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}



