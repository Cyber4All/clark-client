import { Component, Input, OnInit } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-highlighted-learning-object',
  templateUrl: './highlighted-learning-object.component.html',
  styleUrls: ['./highlighted-learning-object.component.scss']
})
export class HighlightedLearningObjectComponent implements OnInit {

  @Input() learningObject: LearningObject;
  @Input() statusDescription;

  constructor() { }

  ngOnInit(): void {
  }

}
