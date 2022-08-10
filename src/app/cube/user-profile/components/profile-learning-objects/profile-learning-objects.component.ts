import { Component, Input, OnInit } from '@angular/core';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { UserService } from 'app/core/user.service';
import { CollectionService } from 'app/core/collection.service';
import { element } from 'protractor';

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
  collectionsFullReleased = [];
  collectionsFullUnreleased;
  tempCollectionsReleased = [];
  tempCollectionsUnreleased = [];
  currentPage = 1;


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
    this.collectionsFullReleased = this.getFullCollectionName(this.collectionsReleased);
    this.collectionsFullUnreleased = this.getFullCollectionName(this.collectionsUnreleased);
    };


  activateMainTab(tabName: string) {
    if(tabName === 'released') {
      this.tabMain = 1;
    } else if(tabName === 'review') {
      this.tabMain = 2;
    }
    // else if (tabName === 'relevency') this.tabMain = 3;
    return this.tabMain;
  }

  activateCollectionTab(tabName: string) {
    if(this.tabMain === 1) {
      this.tabCollection = this.collectionsReleased.indexOf(tabName);
    } else if (this.tabMain === 2){
      this.tabCollection = this.collectionsUnreleased.indexOf(tabName);
    }
    return this.tabCollection;
  }

  content(status: number, collection: string) {
    if (status === 1) {
      this.learningObjectsReleased = this.learningObjects.filter(learningObject => {
        return learningObject.status === 'released' && learningObject.collection === collection;
      });
    } else if (status === 2) {
      if (collection === 'Other') {
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

  toggleDropdown(open: boolean) {
    const x = [1, 2, 3];
    this.mobileDropdown = open;
  }

  genCollections(arr: any){
    arr.forEach(element => {
      if (element.collection === ''){
      element.collection = 'Other';
    }
    });
    return [...new Set(arr.map(x => x.collection))];
  }

   getFullCollectionName(arr: any){
    const fullName = [];
    fullName.forEach(element => {
      if(element !== 'Other') {
        element = this.collectionService.getCollection(element).then(c => {
          fullName.push(c.name);
        });
      } else {
        fullName.push(element);
      }
    });
    return fullName;
  }
}
