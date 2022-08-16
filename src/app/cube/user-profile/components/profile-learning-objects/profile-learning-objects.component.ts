import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'clark-profile-learning-objects',
  templateUrl: './profile-learning-objects.component.html',
  styleUrls: ['./profile-learning-objects.component.scss']

})
export class ProfileLearningObjectsComponent implements OnInit, OnChanges {
  private _collectionsAbreviated = new BehaviorSubject<[]>([]);
  private _learningObjects = new BehaviorSubject<[]>([]);
  @Input() set learningObjects(objects: []) {
    this._learningObjects.next(objects);
  }
  @Input() set collectionsAbreviated(objects: []) {
    this._collectionsAbreviated.next(objects);
  }
  get collectionsAbreviated() {
    return this._collectionsAbreviated.value;
  }
  get learningObjects() {
    return this._learningObjects.value;
  }

  constructor(
    private collectionService: CollectionService,
    private changeDetector: ChangeDetectorRef
  ) { }
  @Input() username;
  @Input() isUser: boolean;

  tabMain = 1;
  tabCollection = 0;
  mobileDropdown = false;
  loading = true;
  learningObjectsReleased = [];
  learningObjectsUnreleased = [];
  collectionsReleased = [];
  collectionsUnreleased = [];
  tempCollectionsReleased = [];
  tempCollectionsUnreleased = [];

  ngOnInit() { }

  ngOnChanges() {
    this.loading = true;
    this._collectionsAbreviated.subscribe(collectionMeta => {
      this.loading = true;
      this.tempCollectionsReleased = collectionMeta.filter((learningObject: any) => {
        return learningObject.status === 'released';
      });
      this.tempCollectionsUnreleased = collectionMeta.filter((learningObject: any) => {
        return learningObject.status !== 'released';
      });
      this.collectionsReleased = this.genCollections(this.tempCollectionsReleased);
      this.collectionsUnreleased = this.genCollections(this.tempCollectionsUnreleased);
    });
    this._learningObjects.subscribe(objects => {
      this.loading = true;
      this.learningObjectsReleased = objects.filter((learningObject: any) => {
        return learningObject.status === 'released';
      });
      this.learningObjectsUnreleased = objects.filter((learningObject: any) => {
        return learningObject.status !== 'released';
      });
    });
    this.loading = false;
  };

  /**
   * sets active status for released vs unreleased
   *
   * @param tabName the name of the tab clicked (Released or Review)
   */
  activateMainTab(tabName: string) {
    if (tabName === 'released') {
      this.tabMain = 1;
    } else if (tabName === 'review') {
      this.tabMain = 2;
    }
  }
  /**
   * sets active status for collection tabs based on whether or not you're in the relased or unreleased tab.
   *
   * @param activatedTab the index of the tab clicked on
   */
  activateCollectionTab(activatedTab: number) {
    this.tabCollection = activatedTab;
  }
  /**
   * retrieves learning objects based on status and collection with specification on how to handle missing collection names.
   *
   * @param status whetehr it's for released or unreleased learning objects
   * @param collection what collection of learning objects is being pulled
   */
  content(status: number, collection: string) {
    if (status === 1) {
      this.learningObjectsReleased = this.learningObjects.filter((learningObject: any) => {
        return learningObject.status === 'released' && learningObject.collection === collection;
      });
    } else if (status === 2) {
      if (collection === 'Drafts') {
        this.learningObjectsUnreleased = this.learningObjects.filter((learningObject: any) => {
          return learningObject.status !== 'released' && learningObject.collection === '';
        });
      } else {
        this.learningObjectsUnreleased = this.learningObjects.filter((learningObject: any) => {
          return learningObject.status !== 'released' && learningObject.collection === collection;
        });
      }
    }
  }

  /**
   * Toggles the dropdown
   *
   * @param open whether or not the dropdown should be open or closed
   */
  toggleDropdown(open: boolean) {
    const x = [1, 2, 3];
    this.mobileDropdown = open;
  }


  /**
   * generates array containing the full collection name and it's abreviated name
   *
   * @param arr array of collections associated with all learning objects made by the user
   * @returns a unique array of collection objections that contains both its abreviated name and full name
   */
  genCollections(arr: any) {
    let uniqueCollectionNames = [];
    const collectionNames = [];

    arr.forEach(element => {
      if (element.collection === '') {
        element.collection = 'Drafts';
      }
    });
    uniqueCollectionNames = [...new Set(arr.map(x => x.collection))];
    for (let i = 0; i < uniqueCollectionNames.length; i++) {
      if (uniqueCollectionNames[i] !== 'Drafts') {
        this.collectionService.getCollection(uniqueCollectionNames[i]).then(c => {
          collectionNames.push(c);
        });
      } else if (uniqueCollectionNames[i] === 'Drafts') {
        collectionNames.push({ abvName: 'Drafts', name: 'Drafts' });
      }
    };
    console.log(collectionNames);
    return collectionNames;
  }
}

