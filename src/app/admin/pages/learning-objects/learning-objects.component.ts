import { ChangeEvent as VirtualScrollerChangeEvent } from 'ngx-virtual-scroller';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { LearningObjectService as PublicLearningObjectService } from 'app/cube/learning-object.service';
import { Query } from 'app/interfaces/query';
import { LearningObject } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { ToasterService } from 'app/shared/modules/toaster';
import { AuthService } from 'app/core/auth.service';
import { Collection, CollectionService } from 'app/core/collection.service';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [PublicLearningObjectService]
})
export class LearningObjectsComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('list') listElement: ElementRef<HTMLElement>;

  learningObjects: LearningObject[] = [];
  searchBarPlaceholder = 'Learning Objects';

  activeLearningObject;

  adminStatusList = Object.keys(LearningObject.Status);
  selectedStatus: string;

  listViewHeightOffset: number;

  _query: Query = {
    currPage: 1,
    limit: 20,
    text: ''
  };

  displayStatusModal = false;

  // the total number of learning objects for a given query as dictated from the API
  total: number;

  loading: boolean;

  userSearchInput$: Subject<string> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();

  // whether or not the virtual scrolling list should continue trying to fetch as it's scrolled
  allResultsReceived: boolean;

  isAdminOrEditor: boolean;

  activeCollection: Collection;

  constructor(
    private publicLearningObjectService: PublicLearningObjectService,
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private auth: AuthService,
    private collectionService: CollectionService
  ) {}

  ngOnInit(): void {
    // query by a username if it's passed in
    this.route.queryParams.subscribe(params => {
      const username = params['username'];

      if (username !== null) {
        this.query = { text: username };
      }
    });

    // listen for changes in the route and append the collection to the query
    this.route.parent.params
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe(async params => {
        this.activeCollection = await (params.collection
          ? await this.collectionService.getCollection(params.collection)
          : undefined);

        if (this.activeCollection) {
          this.query = { collection: this.activeCollection.abvName };
        } else {
          this.query = { collection: undefined };
        }

        this.getLearningObjects();
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

  ngAfterViewInit() {
    this.listViewHeightOffset =
      // 50 here is the browser-rendered height of the table-headers
      this.listElement.nativeElement.getBoundingClientRect().top + 50;
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
        this.query = { currPage: this.query.currPage + 1 };
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
          console.error(error);
          this.toaster.notify(
            'Error!',
            'There was an error fetching collections. Please try again later.',
            'bad',
            'far fa-times'
          );
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  /**
   *Retrieve an author's Learning Objects
   *
   * @param {string} author the username of the author
   * @memberof LearningObjectsComponent
   */
  getUserLearningObjects(author: string) {
    const query = {
      text: author
    };
    this.publicLearningObjectService
      .getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
      })
      .catch(error => {
        this.toaster.notify(
          'Error!',
          'There was an error fetching this user\'s Learning Objects. Please try again later.',
          'bad',
          'far fa-times'
        );
        console.error(error);
      });
  }

  /**
   * Update the status filters object and reset the Learning Objects query
   *
   * @param {string[]} statuses the list of statuses by which to filter
   * @memberof LearningObjectsComponent
   */
  getStatusFilteredLearningObjects(statuses: string[]) {
    this.query = { status: statuses, currPage: 1 };
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
}
