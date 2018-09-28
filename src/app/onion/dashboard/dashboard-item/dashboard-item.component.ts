import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { DashboardLearningObject } from '../dashboard.component';
import { ContextMenuService } from '../../../shared/contextmenu/contextmenu.service';

@Component({
  selector: 'clark-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements OnInit {

  @Input()
  learningObject: DashboardLearningObject;
  @Input()
  selected = false;
  @Input()
  disabled = false;

  @Output()
  select: EventEmitter<boolean> = new EventEmitter();
  @Output()
  delete: EventEmitter<void> = new EventEmitter();

  itemMenu: string;
  meatballAnchor: HTMLElement;

  // map of state strings to icons and tooltips
  states: Map<string, { icon: string; tip: string }>;

  // flags
  meatballOpen = false;

  constructor(private contextMenuService: ContextMenuService ) {}

  toggleContextMenu(event: MouseEvent) {
    if (this.itemMenu) {
      if (!this.meatballOpen) {
        this.contextMenuService.open(this.itemMenu, event.currentTarget as HTMLElement, {top: 5, left: 10});
      } else {
        this.contextMenuService.destroy(this.itemMenu);
      }

      this.meatballOpen = !this.meatballOpen;
    } else {
      console.error('Error! Attempted to open an unregistered context menu!');
    }
  }

  ngOnInit() {
    // TODO move the tooltips to a copy file
    this.states = new Map([
      [
        'denied',
        {
          icon: 'fa-ban',
          tip:
            'This learning object was rejected. Contact your review team for further information'
        }
      ],
      [
        'published',
        {
          icon: 'fa-eye',
          tip: 'This learning object is published and can be browsed for.'
        }
      ],
      [
        'review',
        {
          icon: 'fa-sync',
          tip:
            'This object is currently under review by the ' +
            this.learningObject.collection +
            ' review team, It is not yet published and cannot be edited until the review process is complete.'
        }
      ],
      [
        'waiting',
        {
          icon: 'fa-hourglass',
          tip:
            'This learning object is waiting to be reviewed by the next available reviewer from the ' +
            this.learningObject.collection +
            ' review team'
        }
      ],
      [
        'unpublished',
        {
          icon: 'fa-eye-slash',
          tip:
            'This learning object is visible only to you. Submit it for review to make it publicly available.'
        }
      ]
    ]);
  }

  /**
   * Emits a value for checkbox to parent component
   * @param val either the empty string (true) or a minus sign (false)
   */
  toggleSelect(val) {
    this.select.emit(val !== '-');
  }
}
