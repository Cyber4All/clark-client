import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';

@Component({
  selector: 'cube-children-detail-view',
  styleUrls: ['children-detail-view.component.scss'],
  templateUrl: 'children-detail-view.component.html'
})

export class ChildrenDetailViewComponent implements OnInit {
  @Input() children: LearningObject[];
  @Input() length: string;

  constructor() { }

  ngOnInit() { }
}
