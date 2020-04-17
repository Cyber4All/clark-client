import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { LearningObject } from '@entity';
import { LearningObjectService as PublicLearningObjectService } from 'app/cube/learning-object.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { AuthService } from 'app/core/auth.service';
import { Collection, CollectionService } from 'app/core/collection.service';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Query } from 'app/interfaces/query';
import { ChangeEvent as VirtualScrollerChangeEvent } from 'ngx-virtual-scroller';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'; 

@Component({
  selector: 'clark-featured-objects',
  templateUrl: './featured-objects.component.html',
  styleUrls: ['./featured-objects.component.scss'],
  providers: [PublicLearningObjectService]
})
export class FeaturedObjectsComponent implements OnInit, OnDestroy {
  @ViewChild('list') listElement: ElementRef<HTMLElement>;
  @ViewChild('headers') headersElement: ElementRef<HTMLElement>;

  learningObjects: LearningObject[] = [];
  searchBarPlaceholder = 'Learning Objects';
  listViewHeightOffset: number;

  _query: Query = {
    status: ['released'],
    currPage: 1,
    limit: 20,
    text: ''
  };

  userSearchInput$: Subject<string> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();

  isAdminOrEditor: boolean;

  activeCollection: Collection;

  // whether or not the virtual scrolling list should continue trying to fetch as it's scrolled
  allResultsReceived: boolean;

  loading: boolean;

  constructor(
    private publicLearningObjectService: PublicLearningObjectService,
    private route: ActivatedRoute,
    private toaster: ToastrOvenService,
    private auth: AuthService,
    private collectionService: CollectionService,
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.listViewHeightOffset =
        this.listElement.nativeElement.getBoundingClientRect().top +
        this.headersElement.nativeElement.getBoundingClientRect().height;
    });

    // listen for input events from the search component and perform the search action
    this.userSearchInput$
      .pipe(
        takeUntil(this.componentDestroyed$),
        debounceTime(650)
      )
      .subscribe(searchTerm => {
        this.query = { currPage: 1, text: searchTerm };
        this.learningObjects = [];

        this.getLearningObjects();
      });

    this.isAdminOrEditor = this.auth.hasEditorAccess();

    if (this.isAdminOrEditor || this.activeCollection) {
      this.getLearningObjects();
    }
  }

  /**
   * Return to Query object
   *
   * @type {Query}
   * @memberof LearningObjectsComponent
   */
  get query(): Query {
    return this._query;
  }

  /**
   * Sets the specified properties onto the Query object
   *@param {Partial<Query>} q an object with the properties and their values with which to update the Query object
   * @memberof LearningObjectsComponent
   */
  set query(q: Partial<Query>) {
    // tslint:disable-next-line:forin
    for (const key in q) {
      this.query[key] = q[key];
    }

    // if we have more than one property to change or the one property we have to change isn't the current page, reset the search
    if (Object.keys(q).length > 1 || !Object.keys(q).includes('currPage')) {
      this.allResultsReceived = false;
    }
  }

  /**
   * Retrieve Learning Objects from the service
   *
   * @param {VirtualScrollerChangeEvent} [event] the event dictating that the virtual scroller has reached the end of the current list
   * @returns
   * @memberof LearningObjectsComponent
   */
  getLearningObjects(event?: VirtualScrollerChangeEvent) {
    if (!this.allResultsReceived) {
      // we know there are more objects to pull
      this.loading = true;

      if (
        event &&
        (event.end < 0 || event.end !== this.learningObjects.length - 1)
      ) {
        // this is a false event from the virtual scroller, disregard
        return;
      }

      if (this.learningObjects.length) {
        // we've already made an initial request to load the first page of results, increment the current page before next request
        this.query = { status: ['released'], currPage: this.query.currPage + 1 };
      }

      this.publicLearningObjectService
        .getLearningObjects(this.query)
        .then(val => {
          this.learningObjects = this.learningObjects.concat(
            val.learningObjects
          );

          if (this.learningObjects.length === val.total) {
            this.allResultsReceived = true;
          }
        })
        .catch(error => {
          this.toaster.error(
            'Error!',
            'There was an error fetching collections. Please try again later.'
          );
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  /**
   * Update the status filters object and reset the Learning Objects query
   *
   * @param {string[]} statuses the list of statuses by which to filter
   * @memberof LearningObjectsComponent
   */
  getStatusFilteredLearningObjects(statuses: string[]) {
    this.query = { status: ['released'], currPage: 1 };
    this.learningObjects = [];

    this.getLearningObjects();
  }

  /**
   * Update the Query's collection parameter and reset the Learning Objects query
   *
   * @param {string} collection the abbreviated name of the collection by which to filter
   * @memberof LearningObjectsComponent
   */
  getCollectionFilteredLearningObjects(collection: string) {
    this.query = { collection, currPage: 1 };
    this.learningObjects = [];

    this.getLearningObjects();
  }

  /**
   * Clear the filters of both collection and status and reset the Learning Objects query
   *
   * @memberof LearningObjectsComponent
   */
  clearStatusAndCollectionFilters() {
    this.query = { collection: undefined, status: undefined, currPage: 1 };
    this.learningObjects = [];

    this.getLearningObjects();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }



  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
}
