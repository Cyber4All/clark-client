import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { DashboardLearningObject } from '../dashboard.component';
import { ContextMenuService } from '../../../shared/contextmenu/contextmenu.service';
import { LearningObjectStatus } from '@env/environment';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'clark-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss']
})
export class DashboardItemComponent implements OnChanges {

  @Input()
  learningObject: DashboardLearningObject;
  // the status of the learning object (passed in separatly for change detection)
  @Input()
  status: string;
  // is this object selected
  @Input()
  selected = false;
  // this object has no meatball menu,no checkbox, and no hover effect
  @Input()
  disabled = false;
  // this object is not rendered to the dom
  @Input()
  hidden = false;
  // this object has extra padding on the sides to push it's content towards the center
  @Input()
  small = false;
  // does this object have a meatball
  @Input()
  meatball = true;

  // fired when the checkbox for this element is fired
  @Output()
  select: EventEmitter<boolean> = new EventEmitter();
  // fired when the delete option is selected from the context menu
  @Output()
  delete: EventEmitter<void> = new EventEmitter();
  // fired when the edit children option is selected from the context menu
  @Output()
  editChildren: EventEmitter<void> = new EventEmitter();
  // fired when the submit for review option is selected from the context menu
  @Output()
  submit: EventEmitter<void> = new EventEmitter();
  // fired when the cancel submission option is selected from the context menu
  @Output()
  cancelSubmission: EventEmitter<void> = new EventEmitter();

  // id of the context menu returned from the context-menu component
  itemMenu: string;

  // map of state strings to icons and tooltips
  states: Map<string, { icon: string; tip: string }>;

  // flags
  meatballOpen = false;
  showStatus = true;

  constructor(private contextMenuService: ContextMenuService, private auth: AuthService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.status) {
    // TODO move the tooltips to a copy file
      this.states = new Map([
        [
          LearningObjectStatus.DENIED,
          {
            icon: 'fa-ban',
            tip:
              'This learning object was rejected. Contact your review team for further information'
          }
        ],
        [
          LearningObjectStatus.PUBLISHED,
          {
            icon: 'fa-eye',
            tip: 'This learning object is published and can be browsed for.'
          }
        ],
        [
          LearningObjectStatus.UNDER_REVIEW,
          {
            icon: 'fa-sync',
            tip:
              'This object is currently under review by the ' +
              this.learningObject.collection +
              ' review team, It is not yet published and cannot be edited until the review process is complete.'
          }
        ],
        [
          LearningObjectStatus.WAITING,
          {
            icon: 'fa-hourglass',
            tip:
              'This learning object is waiting to be reviewed by the next available reviewer from the ' +
              this.learningObject.collection +
              ' review team'
          }
        ],
        [
          LearningObjectStatus.UNPUBLISHED,
          {
            icon: 'fa-eye-slash',
            tip:
              'This learning object is visible only to you. Submit it for review to make it publicly available.'
          }
        ]
      ]);
    }
  }

  /**
   * Hides or shows the learning object context menu
   * @param event {MouseEvent} the event from which to grab the anchor element
   */
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

  /**
   * Given a string representation of a context menu action, returns true if that action should be allowed based on
   * parameters such as learing object length and learning object status
   * @param action {string} the action in question
   */
  actionPermissions(action: string) {
    const permissions = {
      edit: ['unpublished', 'published', 'denied'],
      editChildren: ['unpublished', 'published', 'denied', this.learningObject.length !== 'nanomodule'],
      manageMaterials: ['unpublished', 'published', 'denied', this.verifiedEmail],
      submit: ['unpublished', 'denied', this.verifiedEmail],
      view: ['published', this.verifiedEmail],
      delete: ['unpublished', 'denied'],
      cancelSubmission: ['waiting', this.verifiedEmail]
    };

    const p = permissions[action];

    if (p.includes(false)) {
      return false;
    }

    return p.includes(this.status);
  }

  /**
   * Check the logged in user's email verification status
   * @return {boolean} true if loggedin user has verified their email, false otherwise
   */
  get verifiedEmail(): boolean {
    return this.auth.user.emailVerified;
  }

  /**
   * Emits a value for checkbox to parent component
   * @param val either the empty string (true) or a minus sign (false)
   */
  toggleSelect(val) {
    this.select.emit(val !== '-');
  }
}
