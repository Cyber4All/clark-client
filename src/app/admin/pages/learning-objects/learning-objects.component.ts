import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { LearningObjectService as PublicLearningObjectService } from '../../../cube/learning-object.service';
import { OrderBy, Query, SortType } from '../../../interfaces/query';
import { LearningObject } from '../../../../entity';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { ToastrOvenService } from '../../../shared/modules/toaster/notification.service';
import { AuthService } from '../../../core/auth-module/auth.service';
import { Collection, CollectionService } from '../../../core/collection-module/collections.service';
@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [PublicLearningObjectService]
})
export class LearningObjectsComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('list') listElement: ElementRef<HTMLElement>;
  @ViewChild('headers') headersElement: ElementRef<HTMLElement>;

  learningObjects: LearningObject[] = [];
  searchBarPlaceholder = 'Learning Objects';
  lastPage: number;

  activeLearningObject;

  adminStatusList = Object.keys(LearningObject.Status);
  selectedStatus: string;

  listViewHeightOffset: number;

  _query: Query = {
    currPage: 1,
    limit: 20,
    sortType: -1,
    orderBy: OrderBy.Date,
    text: '',
    collection: '',
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

  isCurator: boolean;

  activeCollection: Collection;

  topAdjustment: number;

  @Input() showOptions: boolean;

  // Selection variables
  selected: Map<string, LearningObject> = new Map();
  selectedLearningObjects: LearningObject[] = [];
  allSelected = false;

  constructor(
    private publicLearningObjectService: PublicLearningObjectService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrOvenService,
    private auth: AuthService,
    private cd: ChangeDetectorRef,
    private collectionService: CollectionService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAdminOrEditor = this.auth.hasEditorAccess();
    this.isCurator = this.auth.hasCuratorAccess();

    if (this.isCurator && !this.isAdminOrEditor) {
      // Get first curator access group only
      const groups = this.auth.accessGroups[0];
      // Split to get collection name
      const collection = groups.split('@');
      // Retrieve curators for collection
      const curators: any = await this.collectionService.getCollectionCuratorsInfo(collection[1]);
      // If the user is a curator, set the collection
      curators.map(curator => {
        if (curator.username === this.auth.user.username) {
          this.query = {
            collection: collection[1]
          };
        }
      });
    }
    // query by anything if it's passed in
    // reset page to 1 since we can't scroll backwards
    this.route.queryParams.subscribe(params => {
      this.query = {
        ...params,
        currPage: (params.currPage && !isNaN(params.currPage)) ? parseInt(params.currPage, 10) : 1,
       };
    });

    // listen for input events from the search component and perform the search action
    this.userSearchInput$
      .pipe(
        takeUntil(this.componentDestroyed$),
        debounceTime(650)
      )
      .subscribe(async searchTerm => {
        this.query = { currPage: 1, text: searchTerm };
        if (!searchTerm || searchTerm.length <= 0) {
          this.query = {
            sortType: SortType.Descending,
            orderBy: OrderBy.Date
          };
        } else {
          this.query = {
            sortType: undefined,
            orderBy: undefined
          };
        }
        this.learningObjects = [];

        await this.getLearningObjects();
      });

    if (this.isAdminOrEditor || this.isCurator) {
      await this.getLearningObjects();
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

  changePage(pageNum) {
    this.listElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start'});
    this.query = {
      currPage: pageNum
    };
    this.getLearningObjects();
  }

  /**
   * Sets the specified properties onto the Query object
   *
   *@param {Partial<Query>} q an object with the properties and their values with which to update the Query object
   * @memberof LearningObjectsComponent
   */
  set query(q: Partial<Query>) {
    // eslint-disable-next-line guard-for-in
    for (const key in q) {
      this.query[key] = q[key];
    }

    // if we have more than one property to change or the one property we have to change isn't the current page, reset the search
    if (Object.keys(q).length > 1 || !Object.keys(q).includes('currPage')) {
      this.allResultsReceived = false;
    }

    this.router.navigate(
      [],
      {
        queryParams: { ...this.query },
        relativeTo: this.route,
        replaceUrl: true
      }
    );
  }

  /**
   * Retrieve Learning Objects from the service
   *
   * @returns
   * @memberof LearningObjectsComponent
   */
  async getLearningObjects() {
    if (!this.allResultsReceived) {
      // we know there are more objects to pull
      this.loading = true;

      await this.publicLearningObjectService
        .getLearningObjects(this.query)
        .then(val => {
          this.learningObjects = val.learningObjects;

          if (this.learningObjects.length === val.total) {
            this.allResultsReceived = true;
          }
          this.lastPage = Math.ceil(val.total / 20);
        })
        .catch(error => {
          this.toaster.error(
            'Error!',
            'There was an error fetching Learning Objects. Please try again later.'
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
    this.query = { status: statuses, currPage: 1 };
    this.learningObjects = [];

    this.getLearningObjects();
  }

  /**
   * Sorts list by date
   *
   * @param direction the direction of the sort (ASC or DESC)
   */
  sortByDate() {
    if(!this.query.sortType) {
      this.query = {
        sortType: SortType.Descending,
        orderBy: OrderBy.Date
      };
    } else if (this.query.sortType.toString() === '-1') {
      this.query.sortType = SortType.Ascending;
    } else if (this.query.sortType.toString() === '1') {
      this.query = {
        sortType: undefined,
        orderBy: undefined
      };
    }

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
   * Updates the queries startNextcheck and endNextCheck values
   *
   * @param dates The start and end dates for the relevancy date filter
   */

  getRelevancyFilteredLearningObjects(dates: any) {
    this.query = { startNextCheck: dates.start, endNextCheck: dates.end, currPage: 1};
    this.learningObjects = [];

    this.getLearningObjects();
  }

  /**
   * Updates the query topics value
   *
   * @param topics The array of topic names to filter by
   */
  getTopicsFilteredLearningObjects(topics: any[]) {
    this.query = { topics, currPage: 1 };
    this.learningObjects = [];

    this.getLearningObjects();
  }

  /**
   * Clear the filters of both collection and status and reset the Learning Objects query
   *
   * @memberof LearningObjectsComponent
   */
  clearStatusAndCollectionFilters() {
    this.query = {
      collection: ((this.isCurator && !this.isAdminOrEditor) ? this.query.collection : undefined),
      topics: undefined,
      status: undefined,
      currPage: 1
    };
    this.learningObjects = [];

    this.getLearningObjects();
  }

  /**
   * Selects all learning objects
   */
  selectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selected = new Map(
        // @ts-ignore
        this.learningObjects.map((learningObject) => [learningObject.id, learningObject])
      );
      this.selectedLearningObjects = this.learningObjects;
      this.cd.detectChanges();
    } else {
      this.selected = new Map();
      this.selectedLearningObjects = [];
    }
  }

   /**
    * Decides based on the value whether to select or deselect the learning object
    *
    * @param l learning object to be selected
    * @param value boolean, true if object is selected, false otherwise
    */
  toggleSelect(l: LearningObject, value: boolean ) {
    value ? this.selectLearningObject(l) : this.deselectLearningObject(l);
  }

    /**
     * Fired on select of a Learning Object, takes the object and either adds to the list of selected Learning Objects
     *
     * @param l Learning Object to be selected
     */
  selectLearningObject(l: LearningObject) {
    this.selected.set(l.id, l);
    this.selectedLearningObjects.push(l);
    this.cd.detectChanges();

    if (
      this.selected.size === this.learningObjects.length &&
      !this.allSelected
    ) {
      this.allSelected = true;
    }
  }

  /**
   * Fired on select of a Learning Object, takes the object and removes it from the list of selected Learning Objects
   *
   * @param l Learning Object to be deselected
   */
  deselectLearningObject(l: LearningObject) {
    this.selected.delete(l.id);
    const index = this.selectedLearningObjects.indexOf(l);
    if (index > -1) {
      this.selectedLearningObjects.splice(index, 1);
    }
    this.cd.detectChanges();

    if (this.selected.size < this.learningObjects.length && this.allSelected) {
      this.allSelected = false;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.listViewHeightOffset =
        this.listElement.nativeElement.getBoundingClientRect().top +
        this.headersElement.nativeElement.getBoundingClientRect().height;
    }, 2000);
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
