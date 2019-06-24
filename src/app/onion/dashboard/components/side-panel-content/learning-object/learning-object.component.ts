import { Component, Input } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-panel-learning-object',
  templateUrl: './learning-object.component.html',
  styleUrls: ['./learning-object.component.scss']
})
export class LearningObjectComponent {

  @Input() learningObject: LearningObject;
}
