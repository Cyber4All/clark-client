import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';

import { StatusDescriptions } from 'environments/status-descriptions';
import { DashboardLearningObject } from 'app/onion/dashboard/dashboard.component';
import { ContextMenuService } from '../contextmenu/contextmenu.service';
import { AuthService } from 'app/core/auth.service';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardItemComponent implements OnChanges {
  @Input()
  learningObject: DashboardLearningObject;
  // the status of the learning object (passed in separately for change detection)
  @Input()
  status: string;
  // Does this item include a checkbox
  @Input()
  hasCheckBox = true;
  // Does this item include a author name
  @Input()
  hasAuthor = false;
  // Does the current user have administrator privileges
  @Input()
  isAdmin = false;
  // Display context menu for the collection dashboard
  @Input()
  collectionDashboard = false;
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
  // fired when the view user option is selected from the context menu
  @Output()
  viewUser: EventEmitter<string> = new EventEmitter();
  // Change status
  @Output()
  changeStatus: EventEmitter<LearningObject> = new EventEmitter();


  @Output()
  viewAllChangelogs: EventEmitter<string> = new EventEmitter();

  // id of the context menu returned from the context-menu component
  itemMenu: string;

  statusDescription: string;

  // flags
  meatballOpen = false;
  showStatus = true;

  constructor(
    private contextMenuService: ContextMenuService,
    private auth: AuthService,
    private statuses: StatusDescriptions
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.status) {
      this.statuses
        .getDescription(
          changes.status.currentValue,
          this.learningObject.collection
        )
        .then(desc => {
          this.statusDescription = desc;
        });
    }
  }

  /**
   * Hides or shows the learning object context menu
   * @param event {MouseEvent} the event from which to grab the anchor element
   */
  toggleContextMenu(event: MouseEvent) {
    if (this.itemMenu) {
      if (!this.meatballOpen) {
        this.contextMenuService.open(
          this.itemMenu,
          event.currentTarget as HTMLElement,
          { top: 2, left: 10 }
        );
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
      edit: ['unreleased', 'denied'],
      editChildren: [
        'unreleased',
        'denied',
        this.learningObject.length !== 'nanomodule'
      ],
      manageMaterials: ['unreleased', 'denied', this.verifiedEmail],
      submit: ['unreleased', 'denied', this.verifiedEmail],
      view: ['released'],
      delete: ['unreleased', 'denied'],
      cancelSubmission: ['waiting', this.verifiedEmail]
    };

    const p = permissions[action];

    if (p.includes(false)) {
      return false;
    }

    return p.includes(this.status);
  }

   /**
   * Given a string representation of a context menu action, returns true if that action should be allowed based on
   * parameters such as learing object length and learning object status
   * @param action {string} the action in question
   */
  adminActionPermissions() {
    return this.auth.hasCuratorAccess();
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

  /**
   * Takes a learning object and returns a list of it's children's names or an empty list
   * @return {string[]}
   */
  objectChildrenNames(learningObject: DashboardLearningObject): string[] {
    if (learningObject.children && learningObject.children.length) {
      return (learningObject.children as DashboardLearningObject[]).map(
        l => l.name
      );
    } else {
      return [];
    }
  }
}
