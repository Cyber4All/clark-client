import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LearningObject } from '@entity';

import { ActivateDirective } from '../../../../../../shared/directives/activate.directive';


@Component({
    selector: 'clark-hierarchy-link',
    templateUrl: './hierarchy-link.component.html',
    styleUrls: ['./hierarchy-link.component.scss'],
    standalone: true,
    imports: [ActivateDirective]
})
export class HierarchyLinkComponent {

  @Input() children: LearningObject[];
  @Input() parents: LearningObject[];

  @Output() linkClickEvent: EventEmitter<void> = new EventEmitter();

  emitLinkClickEvent(): void {
    this.linkClickEvent.emit();
  }
}
