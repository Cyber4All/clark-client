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
  collectionsFullReleased = [];
  collectionsFullUnreleased;
  tempCollectionsReleased = [];
  tempCollectionsUnreleased = [];

  ngOnInit() {}

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
      this.collectionsFullReleased = this.getFullCollectionName(this.collectionsReleased);
      this.collectionsFullUnreleased = this.getFullCollectionName(this.collectionsUnreleased);
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

  activateMainTab(tabName: string) {
    if(tabName === 'released') {
      this.tabMain = 1;
    } else if(tabName === 'review') {
      this.tabMain = 2;
    }
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

  toggleDropdown(open: boolean) {
    const x = [1, 2, 3];
    this.mobileDropdown = open;
  }

  genCollections(arr: any){
    arr.forEach(element => {
      if (element.collection === ''){
      element.collection = 'Drafts';
    }
    });
     return [...new Set(arr.map(x => x.collection))];
  }

   getFullCollectionName(arr: any){
    const fullName = [];
    arr.forEach(element => {
      if(element !== 'Drafts') {
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
