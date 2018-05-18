import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-dashboard-learning-object-panel',
  templateUrl: './dashboard-learning-object-panel.component.html',
  styleUrls: ['./dashboard-learning-object-panel.component.scss']
})
export class DashboardLearningObjectPanelComponent implements OnInit {
  editing = false;

  // inputs
  @Input('learningObject') learningObject: LearningObject;

  constructor() { }

  ngOnInit() {
    console.log(this.learningObject);
  }

  editChildren() {
    this.editing = !this.editing;
  }

}
