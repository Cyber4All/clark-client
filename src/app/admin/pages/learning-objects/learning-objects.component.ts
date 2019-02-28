import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from 'app/cube/learning-object.service';

@Component({
  selector: 'clark-learning-objects',
  templateUrl: './learning-objects.component.html',
  styleUrls: ['./learning-objects.component.scss'],
  providers: [LearningObjectService]
})
export class LearningObjectsComponent implements OnInit {

  learningObjects: any;
  searchBarPlaceholder = 'Learning Objects';

  constructor(
    private learningObjectService: LearningObjectService,
  ) { }

  ngOnInit() {}

  getLearningObjects(text: string) {
    console.log(text);
    const query = {
      text
    };
    this.learningObjectService.getLearningObjects(query)
      .then(val => {
        this.learningObjects = val.learningObjects;
      });
  }
 }
