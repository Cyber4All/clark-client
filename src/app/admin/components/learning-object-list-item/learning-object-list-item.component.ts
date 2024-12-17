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
import { AuthService } from 'app/core/auth-module/auth.service';
import { LearningObject } from '@entity';
import { HttpHeaders } from '@angular/common/http';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { LearningObjectService } from 'app/core/learning-object-module/learning-object/learning-object.service';
import {
  LearningObjectService as RefactoredLearningObjectService
} from 'app/core/learning-object-module/learning-object/learning-object.service';
import { RevisionsService } from 'app/core/learning-object-module/revisions/revisions.service';

@Component({
  selector: 'clark-learning-object-list-item',
  templateUrl: './learning-object-list-item.component.html',
  styleUrls: ['./learning-object-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearningObjectListItemComponent implements OnChanges {
  @Input()
  learningObject: LearningObject;
  // the status of the learning object (passed in separately for change detection)
  @Input()
  status: string;

  // fired when the checkbox for this element is fired
  @Output()
  select: EventEmitter<boolean> = new EventEmitter();
  // is this object selected
  @Input()
  selected = false;

  // fired when the view user option is selected from the context menu
  @Output()
  viewUser: EventEmitter<string> = new EventEmitter();
  // Change status
  @Output()
  changeStatus: EventEmitter<LearningObject> = new EventEmitter();

  statusDescription: string;

  showChangeAuthor: boolean;
  showUnreleaseConfirm: boolean;
  showRelevancyDate: boolean;
  showDeleteRevisionConfirmation: boolean;
  showChangeCollection: boolean;
  showHierarchyBuilder: boolean;
  showReleasingHierarchyPopup: boolean;

  // flags
  meatballOpen = false;

  hasParents = false;
  hasChildren = false;

  private headers = new HttpHeaders();
  constructor(
    private auth: AuthService,
    private statuses: StatusDescriptions,
    private cd: ChangeDetectorRef,
    private toaster: ToastrOvenService,
    private learningObjectService: LearningObjectService,
    private refactoredLearningObjectService: RefactoredLearningObjectService,
    private revisionsService: RevisionsService,
  ) { }

  async ngOnChanges(changes: SimpleChanges) {
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
    await this.checkForParents();
    await this.checkForChildren();
  }

  /**
   * Open or close the meatball menu
   *
   * @param {boolean} [value] true if menu is open, false otherwise
   * @memberof LearningObjectListItemComponent
   */
  toggleContextMenu(value?: boolean) {
    this.meatballOpen = value;
  }

  /**
   * Toggles the change author modal from showing/hiding
   *
   * @param value True if showing, false otherwise
   */
  toggleChangeAuthorModal(value: boolean) {
    this.showChangeAuthor = value;
  }

  /**
   * Toggles the unrelease confirm modal from showing/hiding
   *
   * @param value True if showing, false otherwise
   */
  toggleUnreleaseConfirm(value: boolean) {
    this.showUnreleaseConfirm = value;
  }

  /**
   * Closes the unrelease a object modal with a value for if the user
   * confirmed they want to unrelease a object
   *
   * @param value True if wanting to unrelease, false otherwise
   */
  closeUnreleaseModal(value: boolean) {
    this.toggleUnreleaseConfirm(false);
    if (value) {
      this.unreleaseLearningObject();
    }
  }

  /**
   * Opens or closes the change collection modal based
   * on the passed value
   *
   * @param value true (if open), false otherwise
   */
  toggleChangeCollectionModal(value: boolean) {
    this.showChangeCollection = value;
  }

  /**
   * Reaches to a service to unrelease the object.
   */
  unreleaseLearningObject() {
    this.refactoredLearningObjectService
      .updateLearningObjectStatus(
        this.learningObject.id,
        LearningObject.Status.PROOFING
      )
      .then(() => {
        this.toaster.success('Success', 'Learning object was successfully unreleased');
        this.learningObject.status = LearningObject.Status.PROOFING;
      })
      .catch(() => this.toaster.error('Error', 'There was an issue unreleasing this learning object, please try again later'));
  }

  /**
   * Check the logged in user's email verification status
   *
   * @return {boolean} true if logged in user has verified their email, false otherwise
   */
  get verifiedEmail(): boolean {
    return this.auth.user.emailVerified;
  }

  async checkForParents() {
    this.hasParents = (await this.learningObjectService.getLearningObjectParents(this.learningObject.id)).length > 0;
  }

  /**
   * Checks if the learning object has any children
   */
  async checkForChildren() {
    this.hasChildren = (await this.learningObjectService.getLearningObjectChildren(this.learningObject.id)).length > 0;
  }

  /**
   * Toggles the modal for Relevancy Date selection
   */

  toggleRelevancyDate(toggle: boolean) {
    this.showRelevancyDate = toggle;
  }

  /**
   * Toggles the delete revision selection
   */

  toggleRevisionDelete(toggle: boolean) {
    this.showDeleteRevisionConfirmation = toggle;
  }

  goToUrl(url) {
    if (url === 'builder') {
      window.open(`/onion/learning-object-builder/${this.learningObject.cuid}/${this.learningObject.version}`);
    } else if (url === 'contact') {
      window.open(`/users/${this.learningObject.author.username}`);
    } else if (url === 'details') {
      window.open(`/details/${this.learningObject.author.username}/${this.learningObject.cuid}/${this.learningObject.version}`);
    } else if (url === 'relevancy') {
      window.open(`/onion/relevancy-builder/${this.learningObject.cuid}`);
    } else if (url === 'revision builder') {
      window.open(`/onion/learning-object-builder/${this.learningObject.cuid}/${this.learningObject.version + 1}`);
    }
  }

  toggleHierarchyBuilder(val: boolean) {
    this.showHierarchyBuilder = val;
  }

  toggleReleasingHierarchy(val: boolean) {
    this.showReleasingHierarchyPopup = val;
  }

  releaseHierarchy() {
    this.toggleReleasingHierarchy(true);
    this.learningObjectService.releaseHierarchy(this.learningObject.id)
      .then(() => {
        this.toggleReleasingHierarchy(false);
        location.reload();
      }).catch(error => {
        this.toaster.error('Error!', error.message);
      });
  }

  deleteRevision() {
    this.revisionsService.deleteRevision(this.learningObject.cuid, this.learningObject.version + 1)
      .then(() => {
        this.toaster.success('Success', 'Learning object unreleased revision deleted successfully');
      }).catch(() => {
        this.toaster.error('Error', 'There was an issue deleting the revision of this learning object, please try again later');
      });
    this.toggleRevisionDelete(false);
  }
  /**
   * Emits a value for checkbox to parent component
   *
   * @param val either the empty string (true) or a minus sign (false)
   */
  toggleSelect(val) {
    this.select.emit(val);
  }

}
