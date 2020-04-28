import { Component, OnInit } from '@angular/core';
import { LearningObject, Collection } from '@entity';
import { FeaturedObjectsService } from 'app/core/featuredObjects.service';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { Query } from 'app/interfaces/query';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
@Component({
  selector: 'clark-featured',
  templateUrl: './featured.component.html',
  styleUrls: ['./featured.component.scss'],
  providers: [LearningObjectService]
})
export class FeaturedComponent implements OnInit {
  // Object Arrays
  learningObjects: LearningObject[];
  featuredObjects;

  // Error states
  mutationError$;
  submitError$;

  //Search 
  searchBarPlaceholder = 'Learning Objects';
  total: number;
  loading: boolean;
  userSearchInput$: Subject<string> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();

  allResultsReceived: boolean;
  isAdminOrEditor: boolean;
  activeCollection: Collection;



  // Query for retrieve
  query: Query = {
    limit: 20,
    status: [LearningObject.Status.RELEASED],
    test: ''
  };
  saveError: boolean;
  constructor(
    private featureService: FeaturedObjectsService,
    private toaster: ToastrOvenService,
  ) { }

  async ngOnInit() {
    this.featureService.featuredObjects.subscribe(objects => {
      this.featuredObjects = objects;
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

        this.featureService.getNotFeaturedLearningObjects();
      });
    await this.featureService.getFeaturedObjects();
    this.learningObjects = (await this.featureService.getNotFeaturedLearningObjects(this.query)).learningObjects;
  }

  dropFeatured() {
    this.featureService.addFeaturedObject(this.learningObjects[1]);
  }

  removeFeatured() {
    this.featureService.removeFeaturedObject(this.featuredObjects[1]);
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



