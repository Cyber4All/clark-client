import { Component, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { Query } from 'app/interfaces/query';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { CollectionService, Collection } from 'app/core/collection.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'clark-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss'],
  providers: [LearningObjectService]
})
export class FeaturedComponent implements OnInit {
  // Object Arrays
  learningObjects: LearningObject[];
  featuredObjects: LearningObject[];

  // Error states
  mutationError$;
  submitError$;

  // Search
  searchBarPlaceholder = 'Learning Objects';
  total: number;
  loading: boolean;
  userSearchInput$: Subject<string> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();

  allResultsReceived: boolean;
  isAdminOrEditor: boolean;
  activeCollection: Collection;

  // Query for retrieve
  query: Query;

  constructor(
    private featureService: FeaturedObjectsService,
    private toaster: ToastrOvenService,
    private collectionService: CollectionService,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.featureService.featuredObjects.subscribe(objects => {
      this.featuredObjects = objects;
    });

     // listen for changes in the route and append the collection to the query
     this.route.parent.params
     .pipe(takeUntil(this.componentDestroyed$))
     .subscribe(async params => {
       this.activeCollection = await (params.collection
         ? await this.collectionService.getCollection(params.collection)
         : undefined);

       if (this.activeCollection) {
         this.query = { collection: this.activeCollection.abvName, status: [LearningObject.Status.RELEASED] };
       } else {
         this.query = { collection: undefined, status: [LearningObject.Status.RELEASED] };
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
        this.query = { currPage: 1, text: searchTerm, status: [LearningObject.Status.RELEASED] };
        this.learningObjects = [];

        this.getLearningObjects();
      });
    await this.featureService.getFeaturedObjects();
  }

  async getLearningObjects() {
    this.featureService.getNotFeaturedLearningObjects(this.query).then(objects => {
      this.learningObjects = objects.learningObjects;
    });
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
  clearCollectionFilters() {
    this.query = { collection: undefined, currPage: 1 };
    this.learningObjects = [];

    this.getLearningObjects();
  }

  dropFeatured() {
    this.featureService.addFeaturedObject(this.learningObjects[1]);
  }

  removeFeatured(object) {
    this.featureService.removeFeaturedObject(object);
  }
  saveFeatured() {
    this.featureService.saveFeaturedObjects();
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
    this.featureService.setFeatured(this.featuredObjects);
  }
}



