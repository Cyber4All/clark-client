import { ChangeEvent as VirtualScrollerChangeEvent } from 'ngx-virtual-scroller';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LearningObjectService as PublicLearningObjectService } from 'app/cube/learning-object.service';
import { LearningObjectService as PrivateLearningObjectService } from 'app/onion/core/learning-object.service';
import { Query } from 'app/shared/interfaces/query';
import { LearningObject } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { ToasterService } from 'app/shared/toaster';
import { AuthService } from 'app/core/auth.service';
import { Collection, CollectionService } from 'app/core/collection.service';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [
    PublicLearningObjectService,
    PrivateLearningObjectService
  ],
})
export class LearningObjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('list') listElement: ElementRef<HTMLElement>;

  learningObjects: LearningObject[] = [];
  searchBarPlaceholder = 'Learning Objects';

  activeLearningObject;

  adminStatusList =  Object.keys(LearningObject.Status);
  selectedStatus: string;

  listViewHeightOffset: number;

  _query: Query = {
    currPage: 1,
    limit: 20,
    text: ''
  };

  displayStatusModal = false;

  total: number;

  loading: boolean;

  userSearchInput$: Subject<string> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();

  allResultsReceived: boolean;

  isAdminOrEditor: boolean;

  activeCollection: Collection;

  constructor(
    private publicLearningObjectService: PublicLearningObjectService,
    private privateLearningObjectService: PrivateLearningObjectService,
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private auth: AuthService,
    private collectionService: CollectionService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const username = params['username'];

      if (username !== null) {
        this.query = { text: username };
      }
   });

   this.route.parent.params.pipe(
     takeUntil(this.componentDestroyed$)
   ).subscribe(async params => {
     this.activeCollection = await (params.collection ? await this.collectionService.getCollection(params.collection) : undefined);

     if (this.activeCollection) {
       this.query = { collection: this.activeCollection.abvName };
     } else {
       this.query = { collection: undefined };
     }

     this.getLearningObjects();
   });

   this.userSearchInput$.pipe(
     takeUntil(this.componentDestroyed$),
     debounceTime(650)
   ).subscribe(searchTerm => {
     this.query = { currPage: 1, text: searchTerm }
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

  get query() {
    return this._query;
  }

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

  getLearningObjects(event?: VirtualScrollerChangeEvent) {
    if (!this.allResultsReceived) {
      this.loading = true;

      if (event && (event.end < 0 || event.end !== this.learningObjects.length - 1)) {
        return;
      }

      if (this.learningObjects.length) {
        // we've already made an initial request to load the first page of results, increment the current page before next request
        this.query = { currPage: this.query.currPage + 1 };
      }

      this.publicLearningObjectService.getLearningObjects(this.query)
        .then(val => {
          this.learningObjects = this.learningObjects.concat(val.learningObjects);

          if (this.learningObjects.length === val.total) {
            this.allResultsReceived = true;
          }
        }).catch(error => {
          console.error(error);
          this.toaster.notify('Error!', 'There was an error fetching collections. Please try again later.', 'bad', 'far fa-times');
        }).finally(() => {
          this.loading = false;
        });
    }
  }

  getUserLearningObjects(author: string) {
    const query = {
      text: author
    };
    this.publicLearningObjectService.getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
      }).catch(error => {
        this.toaster
          .notify('Error!', 'There was an error fetching this user\'s learning objects. Please try again later.', 'bad', 'far fa-times');
        console.error(error);
      });
  }

  openChangeStatusModal(learningObject: LearningObject) {
    this.displayStatusModal = true;
    this.activeLearningObject = learningObject;
  }

  updateLearningObjectStatus() {
    this.privateLearningObjectService.save(
      this.activeLearningObject.id,
      this.activeLearningObject.author.username,
      { status: this.selectedStatus }
    );
    this.displayStatusModal = false;
  }

  isCurrentStatus(status: string) {
    return this.activeLearningObject.status === status.toLowerCase();
  }

  toggleStatus(status: string) {
    this.selectedStatus = status.toLowerCase();
  }

  getStatusFilteredLearningObjects(statuses: string[]) {
    this.query = { status: statuses, currPage: 1 };
    this.learningObjects = [];

    this.getLearningObjects();
   }

   getCollectionFilteredLearningObjects(collection: string) {
    this.query = { collection, currPage: 1 };
    this.learningObjects = [];

    this.getLearningObjects();
   }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
 }
