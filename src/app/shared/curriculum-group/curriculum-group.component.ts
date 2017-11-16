import { Component, OnInit, Input } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';

@Component({
  selector: 'app-curriculum-group',
  templateUrl: './curriculum-group.component.html'
})
export class CurriculumGroupComponent implements OnInit {
  @Input('group') group;

  constructor(public service: LearningObjectService) { }

  ngOnInit() { }

  public open(learningObject) {
    var url = `http://neutrino.clark.center/view/${learningObject.id}`;
    this.service.openLearningObject(url);
  }

}
