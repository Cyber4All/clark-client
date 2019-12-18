import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-side-panel-content',
  templateUrl: './side-panel-content.component.html',
  styleUrls: ['./side-panel-content.component.scss']
})
export class SidePanelContentComponent implements OnInit {

  @Input() parents: LearningObject[];
  @Input() children: LearningObject[];
  
  constructor() { }

  ngOnInit() {
  }

}
