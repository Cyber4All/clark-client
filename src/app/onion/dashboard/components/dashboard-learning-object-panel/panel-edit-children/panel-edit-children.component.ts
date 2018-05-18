import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-panel-edit-children',
  templateUrl: './panel-edit-children.component.html',
  styleUrls: ['./panel-edit-children.component.scss']
})
export class PanelEditChildrenComponent implements OnInit {

  // inputs
  @Input('children') children: Array<LearningObject>;
  @Input('learningObjects') learningObjects: Array<LearningObject>;

  constructor() { }

  ngOnInit() {
  }

}
