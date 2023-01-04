import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { StatusDescriptions } from 'environments/status-descriptions';
import { AuthService } from 'app/core/auth.service';
import { LearningObject } from 'entity/learning-object/learning-object';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { LearningObjectService as AppLOService } from 'app/core/learning-object.service';
import { UriRetrieverService } from 'app/core/uri-retriever.service';


@Component({
  selector: 'clark-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardItemComponent implements OnInit, OnChanges {
  @Input()
  learningObject: LearningObject;
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
  // Fired when the submit hierarachy option is selected from the context menu
  @Output()
  submitHierarchy: EventEmitter<void> = new EventEmitter();
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

  // parents
  parents: string[] = [];
  children: string[] = [];
  hasChildren = false;

  constructor(
    private auth: AuthService,
    private statuses: StatusDescriptions,
    private cd: ChangeDetectorRef,
    private learningObjectService: LearningObjectService,
    private appLOService: AppLOService,
    private uriRetriever: UriRetrieverService
  ) {}

  async ngOnInit() {
    this.parents = await this.parentNames();
    this.children = await this.objectChildrenNames();
    this.hasChildren = await this.appLOService.doesLearningObjectHaveChildren(
      this.learningObject.author.username,
      this.learningObject.id
    );
    this.cd.detectChanges();
  }

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
   *
   * @param {boolean} [value] true if open, false otherwise
   */
  toggleContextMenu(value?: boolean) {
    this.meatballOpen = value;
  }

  /**
   * Given a string representation of a context menu action, returns true if that action should be allowed based on
   * parameters such as learing object length and learning object status
   *
   * @param action {string} the action in question
   */
  actionPermissions(action: string) {
    const permissions = {
      edit: ['unreleased', 'accepted_minor', 'accepted_major'],
      editChildren: [
        'unreleased',
        'accepted_minor',
        'accepted_major',
        this.learningObject.length !== 'nanomodule'
      ],
      manageMaterials: ['unreleased', 'accepted_minor', 'accepted_major', this.verifiedEmail],
      submit: ['unreleased', 'accepted_minor', 'accepted_major', this.verifiedEmail],
      submitHierarchy: ['unreleased', this.parents.length === 0, this.hasChildren, this.verifiedEmail],
      resubmit: ['accepted_minor', 'accepted_major'],
      view: ['released'],
      delete: ['unreleased', 'rejected'],
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
    *
    * @param action {string} the action in question
    */
  adminActionPermissions() {
    return this.auth.hasCuratorAccess();
  }

  /**
   * Check the logged in user's email verification status
   *
   * @return {boolean} true if logged-in user has verified their email, false otherwise
   */
  get verifiedEmail(): boolean {
    return this.auth.user.emailVerified;
  }

  /**
   * Emits a value for checkbox to parent component
   *
   * @param val either the empty string (true) or a minus sign (false)
   */
  toggleSelect(val) {
    this.select.emit(val);
  }

  /**
   * Takes a learning object and returns a list of it's children's names or an empty list
   *
   * @return {string[]}
   */
  async objectChildrenNames() {
    const result = [];
    if (!this.learningObject.resourceUris) {
      return [];
    }
    return this.uriRetriever.fetchUri(this.learningObject.resourceUris.children).toPromise().then((children: LearningObject[]) => {
      children.forEach(child => {
        result.push(child.name);
      });
      return result;
    }).catch(err => {
      console.error(err);
      return [];
    });
  }

  openInfoPanel() {
    if (!this.meatballOpen) {
      this.viewSidePanel.emit();
    }
  }

  /**
   * Returns the learning objects parent names in an array of strings
   */
  async parentNames() {
    const parents = [];
    return this.learningObjectService.fetchParents(this.learningObject.author.username, this.learningObject.id).then(returners => {
      returners.forEach(parent => {
        parents.push(parent.name);
      });
      return parents;
    });
  }
}
