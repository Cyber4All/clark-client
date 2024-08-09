import { Component, Input, OnChanges } from '@angular/core';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'clark-profile-learning-objects',
  templateUrl: './profile-learning-objects.component.html',
  styleUrls: ['./profile-learning-objects.component.scss']

})
export class ProfileLearningObjectsComponent implements OnChanges {

  constructor(
    private collectionService: CollectionService,
  ) { }

  private _learningObjects = new BehaviorSubject<[]>([]);
  @Input() set learningObjects(objects: []) {
    this._learningObjects.next(objects);
  }
  get learningObjects() {
    return this._learningObjects.value;
  }

  // Boolean for a user logged in visiting their profile
  @Input() isUser: boolean;

  // Container View Controls
  loading = true;
  tabMain = 1;
  mobileDropdown = false;

  // Learning Object List Variables
  learningObjectsReleased = [];
  learningObjectsUnreleased = [];

  // Collection Tab Variables
  tabCollection = 0;
  collectionsReleased = [];
  collectionsUnreleased = [];

  async ngOnChanges() {
    this._learningObjects.subscribe(async objects => {
      // Toggle for loading object template FIXME: not really working
      this.loading = true;
      // Clear all values on subscribtion change
      this.tabCollection = 0;
      this.learningObjectsReleased = [];
      this.learningObjectsUnreleased = [];
      this.collectionsReleased = [];
      this.collectionsUnreleased = [];
      // Sort learning objects by status
      objects.map((learningObject: any) => {
        if (learningObject.status === 'released') {
          this.learningObjectsReleased.push(learningObject);
        } else {
          this.learningObjectsUnreleased.push(learningObject);
        }
      });
      // Get promises for full Collection names of obects
      const releasedPromises = await this.genCollections(this.learningObjectsReleased);
      const unreleasedPromises = await this.genCollections(this.learningObjectsUnreleased);
      // Await all promises for Collection names for released objects
      await Promise.allSettled(releasedPromises).then((promise: any) => {
        promise.map( p => {
          if(p.status === 'fulfilled') {
            this.collectionsReleased.push(p.value);
          }
        });
      });
      // Await all promises for Collection names for unreleased objects
      await Promise.allSettled(unreleasedPromises).then((promise: any) => {
        promise.map( p => {
          if(p.status === 'fulfilled') {
            this.collectionsUnreleased.push(p.value);
          }
        });
      });
      // Sort collection names alphabetically
      this.collectionsReleased.sort((a, b) => a.name.localeCompare(b.name));
      this.collectionsUnreleased.sort((a, b) => a.name.localeCompare(b.name));;
      // Default first released collection tab values
      this.content(this.tabMain, this.collectionsReleased[0].abvName);
      this.loading = false;
    });

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
          return learningObject.status !== 'released' && (learningObject.collection === '' || learningObject.collection === 'Drafts');
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
    this.mobileDropdown = open;
  }


  /**
   * generates array containing the full collection name and it's abreviated name
   *
   * @param obj array of all learning objects for this user
   * @returns a unique array of collection objects that contains both its abreviated name and full name
   */
  async genCollections(obj: any) {
    let uniqueCollectionNames = [];
    const collectionNames = [];
    obj.forEach(element => {
      if (element.collection === '') {
        element.collection = 'Drafts';
      }
    });
    uniqueCollectionNames = [...new Set(obj.map(x => x.collection))];
    for (let i = 0; i < uniqueCollectionNames.length; i++) {
      if (uniqueCollectionNames[i] !== 'Drafts') {
        await this.collectionService.getCollection(uniqueCollectionNames[i]).then(c => {
          collectionNames.push(c);
        });
      } else if (uniqueCollectionNames[i] === 'Drafts') {
        collectionNames.push({ abvName: 'Drafts', name: 'Drafts' });
      }
    };
    return collectionNames;
  }
}

