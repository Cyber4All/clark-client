import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { StatusDescriptions } from 'environments/status-descriptions';
import { DashboardLearningObject } from 'app/onion/old-dashboard/old-dashboard.component';
import { AuthService } from 'app/core/auth.service';

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
  // does this object have an active checkmark
  @Input ()
  showCheck = true;

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
  viewAllChangelogs: EventEmitter<string> = new EventEmitter();

  @Output()
  viewSidePanel: EventEmitter<boolean> = new EventEmitter ();

  // id of the context menu returned from the context-menu component
  itemMenu: string;

  statusDescription: string;

  // flags
  meatballOpen = false;
  showStatus = true;

  constructor(
    private auth: AuthService,
    private statuses: StatusDescriptions,
    private cd: ChangeDetectorRef
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
          this.cd.detectChanges();
        });
    }
  }

  /**
   * Hides or shows the learning object context menu
   * @param {boolean} [value] true if open, false otherwise
   */
  toggleContextMenu(value?: boolean) {
    this.meatballOpen = value;
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
      cancelSubmission: ['waiting', this.verifiedEmail],
      infoPanel: ['released']
    };

    const p = permissions[action];

    if (p.includes(false)) {
      return false;
    }

    return p.includes(this.status);
  }

   /**
   * Given a string representation of a context menu action, returns true if that action should be allowed based on
   * parameters such as learning object length and learning object status
   * @param action {string} the action in question
   */
  adminActionPermissions() {
    return this.auth.hasCuratorAccess();
  }

  /**
   * Check the logged in user's email verification status
   * @return {boolean} true if logged-in user has verified their email, false otherwise
   */
  get verifiedEmail(): boolean {
    return this.auth.user.emailVerified;
  }

  /**
   * Emits a value for checkbox to parent component
   * @param val either the empty string (true) or a minus sign (false)
   */
  toggleSelect(val) {
    this.select.emit(val);
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
  openInfoPanel() {
    if (!this.meatballOpen) {
      this.viewSidePanel.emit();
    }
  }
}
