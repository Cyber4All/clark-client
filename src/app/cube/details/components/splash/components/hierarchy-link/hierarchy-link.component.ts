import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';


@Component({
  selector: 'clark-hierarchy-link',
  templateUrl: './hierarchy-link.component.html',
  styleUrls: ['./hierarchy-link.component.scss']
})
export class HierarchyLinkComponent implements OnInit {

  @Input() children: LearningObject[];
  @Input() parents: LearningObject[];

  @Output() linkClickEvent: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  emitLinkClickEvent(): void {
    this.linkClickEvent.emit();
  }

}
