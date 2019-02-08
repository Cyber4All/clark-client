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
import { AuthService } from '../../../core/auth.service';
import { CollectionService } from 'app/core/collection.service';
import { LearningObject } from '@cyber4all/clark-entity';

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

  // map of state strings to tooltips
  states: Map<string, { tip: string }>;

  // flags
  meatballOpen = false;
  showStatus = true;

  constructor(private contextMenuService: ContextMenuService, private auth: AuthService, private collectionService: CollectionService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.status) {
      // TODO move the tooltips to a copy file
      this.buildTooltip();
    }
  }

  /**
   * Hides or shows the learning object context menu
   * @param event {MouseEvent} the event from which to grab the anchor element
   */
  toggleContextMenu(event: MouseEvent) {
    if (this.itemMenu) {
      if (!this.meatballOpen) {
        this.contextMenuService.open(this.itemMenu, event.currentTarget as HTMLElement, {top: 2, left: 10});
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
      editChildren: ['unreleased', 'denied', this.learningObject.length !== 'nanomodule'],
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
      return (learningObject.children as DashboardLearningObject[]).map(l => l.name);
    } else {
      return [];
    }
  }

  buildTooltip() {
    this.collectionService.getCollection(this.learningObject.collection).then(val => {
      this.states = new Map([
        [
          LearningObject.Status.REJECTED,
          {
            tip:
              'This learning object was rejected. Contact your review team for further information'
          }
        ],
        [
          LearningObject.Status.RELEASED,
          {
            tip:
              'This learning object is published to the ' +
                (val ? val.name : '') +
              ' collection and can be browsed for.'
          }
        ],
        [
          LearningObject.Status.PROOFING,
          {
            tip:
              'This learning object is currently undergoing proofing by the editorial team. ' +
              'It is not yet released and cannot be edited until this process is complete.'
          }
        ],
        [
          LearningObject.Status.REVIEW,
          {
            tip:
              'This object is currently under review by the ' +
                (val ? val.name : '') +
              ' review team, It is not yet published and cannot be edited until the review process is complete.'
          }
        ],
        [
          LearningObject.Status.WAITING,
          {
            tip:
              'This learning object is waiting to be reviewed by the next available reviewer from the ' +
                (val ? val.name : '') +
              ' review team'
          }
        ],
        [
          LearningObject.Status.UNRELEASED,
          {
            tip:
              'This learning object is visible only to you. Submit it for review to make it publicly available.'
          }
        ]
      ]);
    });
  }
}
