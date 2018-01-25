import { Component, OnInit, Input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { LearningObjectService } from '../../learning-object.service';

@Component({
  selector: 'app-curriculum-group',
  templateUrl: './curriculum-group.component.html',
  styleUrls: ['./curriculum-group.component.scss']
})
export class CurriculumGroupComponent implements OnInit {
  @Input('group') group;

  constructor(public service: LearningObjectService) { }

  ngOnInit() {
    console.log(this.group);
  }

  public open(learningObject) {
    this.service.openLearningObject(learningObject.url);
  }

}
