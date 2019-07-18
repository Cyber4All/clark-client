import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-panel-learning-object',
  templateUrl: './learning-object.component.html',
  styleUrls: ['./learning-object.component.scss']
})
export class LearningObjectComponent implements OnInit {

  @Input() learningObject: LearningObject;

  constructor() { }

  ngOnInit() {
  }
  get collectionImage() {
    return `${this.learningObject.collection}.png`;
  }
}
