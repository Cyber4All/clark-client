import { Component, OnInit, Input } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';

@Component({
  selector: 'app-curriculum-group',
  templateUrl: './curriculum-group.component.html'
})
export class CurriculumGroupComponent implements OnInit {
  @Input('group') group;

  constructor(public service: LearningObjectService) { }

  ngOnInit() {
    console.log(this.group)
  }

  public open(learningObject) {
    this.service.openLearningObject(learningObject.url);
  }

}
