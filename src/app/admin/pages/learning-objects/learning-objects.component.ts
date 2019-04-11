import { ChangeEvent as VirtualScrollerChangeEvent } from 'ngx-virtual-scroller';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LearningObjectService as PublicLearningObjectService } from 'app/cube/learning-object.service';
import { LearningObjectService as PrivateLearningObjectService } from 'app/onion/core/learning-object.service';
import { Query } from 'app/shared/interfaces/query';
import { LearningObject } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [
    PublicLearningObjectService,
    PrivateLearningObjectService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearningObjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('list') listElement: ElementRef<HTMLElement>;

  learningObjects: LearningObject[] = [];
  searchBarPlaceholder = 'Learning Objects';

  activeLearningObject;

  adminStatusList =  Object.keys(LearningObject.Status);
  selectedStatus: string;

  listViewHeightOffset: number;

  query: Query = {
    currPage: 1,
    limit: 20,
    text: ''
  };

  displayStatusModal = false;

  // boolean value representing the client's notion of whether or not the server will send more objects if the next page is requested
  shouldStillPaginate = true;

  userSearchInput$: Subject<void> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const username = params['username'];
      if (username !== null) {
        this.query.text = username;
        this.getLearningObjects();
      }
   });

   this.userSearchInput$.pipe(
     takeUntil(this.componentDestroyed$),
     debounceTime(650)
   ).subscribe(() => {
     this.getLearningObjects();
   });

   this.getLearningObjects();
  }

  ngAfterViewInit() {
    this.listViewHeightOffset =
      // 50 here is the browser-rendered height of the table-headers
      this.listElement.nativeElement.getBoundingClientRect().top + 50;
  }

  constructor(
    private publicLearningObjectService: PublicLearningObjectService,
    private privateLearningObjectService: PrivateLearningObjectService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) { }

  getLearningObjects(event?: VirtualScrollerChangeEvent) {
    if (event && event.end !== this.learningObjects.length - 1) {
      return;
    }

    if (this.learningObjects.length) {
      // we've already made an initial request to load the first page of results, increment the current page before next request
      this.query.currPage++;
    }

    this.publicLearningObjectService.getLearningObjects(this.query)
      .then(val => {
        this.learningObjects = this.learningObjects.concat(val.learningObjects);
        this.cd.detectChanges();

        if (val.learningObjects.length < this.query.limit || val.learningObjects.length === 0) {
          // do something regarding error handling here
        }
      });
  }

  getUserLearningObjects(author: string) {
    const query = {
      text: author
    };
    this.publicLearningObjectService.getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
        this.cd.detectChanges();
      });
  }

  openChangeStatusModal(learningObject: LearningObject) {
    this.displayStatusModal = true;
    this.activeLearningObject = learningObject;
    this.cd.detectChanges();
  }

  updateLearningObjectStatus() {
    this.privateLearningObjectService.save(
      this.activeLearningObject.id,
      this.activeLearningObject.author.username,
      { status: this.selectedStatus }
    );
    this.displayStatusModal = false;
    this.cd.detectChanges();
  }

  isCurrentStatus(status: string) {
    return this.activeLearningObject.status === status.toLowerCase();
  }

  toggleStatus(status: string) {
    this.selectedStatus = status.toLowerCase();
  }

  getStatusFilteredLearningObjects(statuses: string[]) {
    this.query.status = statuses;
    this.query.currPage = 1;
    this.learningObjects = [];

    this.getLearningObjects();
   }

   getCollectionFilteredLearningObjects(collection: string) {
    this.query.collection = collection;
    this.query.currPage = 1;
    this.learningObjects = [];

    this.getLearningObjects();
   }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
 }
