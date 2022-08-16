import { Component, Input, OnInit } from '@angular/core';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { UserService } from 'app/core/user.service';
import { CollectionService } from 'app/core/collection.service';

@Component({
  selector: 'clark-profile-learning-objects',
  templateUrl: './profile-learning-objects.component.html',
  styleUrls: ['./profile-learning-objects.component.scss']

})
export class ProfileLearningObjectsComponent implements OnInit {
  constructor(
    public learningObjectService: LearningObjectService,
    private userService: UserService,
    private collectionService: CollectionService

  ) { }
  @Input() username;
  @Input() isUser: boolean;
  tabMain = 1;
  tabCollection = 0;
  mobileDropdown = false;
  learningObjects;
  learningObjectsReleased = [];
  learningObjectsUnreleased = [];
  collectionsReleased = [];
  collectionsUnreleased = [];
  collectionsAbreviated;
  tempCollectionsReleased = [];
  tempCollectionsUnreleased = [];
  currentPage = 1;

  //Retrieves learning objects and collections list, sorts them both by released vs unreleased.
  //Collections get stored in a temporary variable that then is used to generate an array of
  //unique collection names. This is then used to generate an array of Full Collection names.
  async ngOnInit() {
    this.learningObjects = await this.learningObjectService.getUsersLearningObjects(this.username);
    this.collectionsAbreviated = await this.userService.getCollectionData(this.username);
    this.learningObjectsReleased = this.learningObjects.filter(learningObject => {
      return learningObject.status === 'released';
    });
    this.learningObjectsUnreleased = this.learningObjects.filter(learningObject => {
      return learningObject.status !== 'released';
    });
    this.tempCollectionsReleased = this.collectionsAbreviated.filter(learningObject => {
      return learningObject.status === 'released';
    });
    this.tempCollectionsUnreleased = this.collectionsAbreviated.filter(learningObject => {
      return learningObject.status !== 'released';
    });
    this.collectionsReleased = this.genCollections(this.tempCollectionsReleased);
    this.collectionsUnreleased = this.genCollections(this.tempCollectionsUnreleased);
  };

  //sets active status for released vs unreleased
  activateMainTab(tabName: string) {
    if (tabName === 'released') {
      this.tabMain = 1;
    } else if (tabName === 'review') {
      this.tabMain = 2;
    }
    // else if (tabName === 'relevency') this.tabMain = 3;
    return this.tabMain;
  }

  //sets active status for collection tabs based on whether or not you're in the relased or
  //unreleased tab.
  activateCollectionTab(tabName: number) {
    console.log(tabName);
    if (this.tabMain === 1) {
      this.tabCollection = tabName;
    } else if (this.tabMain === 2) {
      this.tabCollection = tabName;
    }
    console.log(this.tabCollection);
    console.log(this.collectionsReleased.indexOf(tabName));
    return this.tabCollection;
  }

  //retrieves learning objects based on status and collection with specification on how to
  //handle missing collection names.
  content(status: number, collection: string) {
    if (status === 1) {
      this.learningObjectsReleased = this.learningObjects.filter(learningObject => {
        return learningObject.status === 'released' && learningObject.collection === collection;
      });
    } else if (status === 2) {
      if (collection === 'Drafts') {
        this.learningObjectsUnreleased = this.learningObjects.filter(learningObject => {
          return learningObject.status !== 'released' && learningObject.collection === '';
        });
      } else {
        this.learningObjectsUnreleased = this.learningObjects.filter(learningObject => {
          return learningObject.status !== 'released' && learningObject.collection === collection;
        });
      }
    }
  }

  //toggles dropdown for mobile
  toggleDropdown(open: boolean) {
    const x = [1, 2, 3];
    this.mobileDropdown = open;
  }


  //generates array containing the full collection name and it's abreviated name
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
          collectionNames.push({ ...c });
        });
      } else if (uniqueCollectionNames[i] === 'Drafts') {
        collectionNames.push({abvName: 'Drafts', name:'Drafts'});
      }
    };
    console.log(collectionNames);
    return collectionNames;
  }
}

