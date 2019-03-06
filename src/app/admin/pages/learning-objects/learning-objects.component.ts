import { Component, OnInit } from '@angular/core';
import { LearningObjectService as PublicLearningObjectService } from 'app/cube/learning-object.service';
import { LearningObjectService as PrivateLearningObjectService } from 'app/onion/core/learning-object.service';
import { Query } from 'app/shared/interfaces/query';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [
    PublicLearningObjectService,
    PrivateLearningObjectService
  ]
})
export class LearningObjectsComponent {

  learningObjects: any;
  searchBarPlaceholder = 'Learning Objects';
  loading = false;
  displayStatusModal = false;
  activeLearningObject;
  adminStatusList =  Object.keys(LearningObject.Status);
  selectedStatus: string;

  constructor(
    private publicLearningObjectService: PublicLearningObjectService,
    private privateLearningObjectService: PrivateLearningObjectService,
  ) { }

  getLearningObjects(text: string) {
    this.loading = true;
    const query: Query = {
      text
    };
    this.publicLearningObjectService.getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
        this.loading = false;
      });
  }

  getUserLearningObjects(author: string) {
    this.loading = true;
    const query = {
      text: author
    };
    this.publicLearningObjectService.getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
        this.loading = false;
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
  getFilteredLearningObjects(status: string, isStatus: boolean) {
    console.log(status);
    let query: Query;
    this.loading = true;
    if (isStatus) {
        query = {
          status : [status]
       };
    } else {
      query = {
        collection: status
      };
    }
    this.publicLearningObjectService.getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
        this.loading = false;
      });
   }
 }
