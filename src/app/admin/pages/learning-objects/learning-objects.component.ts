import { Component, OnInit } from '@angular/core';
import { LearningObjectService as publicService } from 'app/cube/learning-object.service';
import { LearningObjectService as privateService } from 'app/onion/core/learning-object.service';
import { Query } from 'app/shared/interfaces/query';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [publicService, privateService]
})
export class LearningObjectsComponent implements OnInit {

  learningObjects: any;
  searchBarPlaceholder = 'Learning Objects';
  loading = false;
  displayStatusModal = false;
  activeLearningObject;
  adminStatusList =  Object.keys(LearningObject.Status);
  selectedStatus: string;

  constructor(
    private publicService: publicService,
    private privateService: privateService,
  ) { }

  ngOnInit() {}

  getLearningObjects(text: string) {
    this.loading = true;
    const query: Query = {
      text
    };
    this.publicService.getLearningObjects(query)
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
    this.publicService.getLearningObjects(query)
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
    this.privateService.save(this.activeLearningObject.id, { status: this.selectedStatus });
    this.displayStatusModal = false;
  }

  isCurrentStatus(status: string) {
    return this.activeLearningObject.status === status.toLowerCase();
  }

  toggleStatus(status: string) {
    this.selectedStatus = status.toLowerCase();
  }
 }
