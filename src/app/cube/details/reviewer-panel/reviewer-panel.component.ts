import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'clark-reviewer-panel',
  templateUrl: './reviewer-panel.component.html',
  styleUrls: ['./reviewer-panel.component.scss']
})
export class ReviewerPanelComponent implements OnInit {
  @Input() learningObject: LearningObject;

  constructor() { }

  ngOnInit() {
  }

}
