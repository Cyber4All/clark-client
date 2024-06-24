import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';


@Component({
  selector: 'clark-hierarchy-link',
  templateUrl: './hierarchy-link.component.html',
  styleUrls: ['./hierarchy-link.component.scss']
})
export class HierarchyLinkComponent {

  @Input() children: LearningObject[];
  @Input() parents: LearningObject[];

  @Output() linkClickEvent: EventEmitter<void> = new EventEmitter();

  emitLinkClickEvent(): void {
    this.linkClickEvent.emit();
  }
}
