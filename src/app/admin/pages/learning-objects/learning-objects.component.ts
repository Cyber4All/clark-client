import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { Query } from 'app/shared/interfaces/query';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [LearningObjectService]
})
export class LearningObjectsComponent implements OnInit {

  learningObjects: any;
  searchBarPlaceholder = 'Learning Objects';
  loading = false;

  constructor(
    private learningObjectService: LearningObjectService,
  ) { }

  ngOnInit() {}

  getLearningObjects(text: string) {
    this.loading = true;
    const query: Query = {
      text
    };
    this.learningObjectService.getLearningObjects(query)
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
    this.learningObjectService.getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
        this.loading = false;
      });
  }
 }
