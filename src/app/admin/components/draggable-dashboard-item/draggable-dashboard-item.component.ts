import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-draggable-dashboard-item',
  templateUrl: './draggable-dashboard-item.component.html',
  styleUrls: ['./draggable-dashboard-item.component.scss']
})
export class DraggableDashboardItemComponent implements OnInit {
  @Input() learningObject: LearningObject;
  @Input() disabled: boolean;
  constructor() { }

  async ngOnInit() {
  }
}
