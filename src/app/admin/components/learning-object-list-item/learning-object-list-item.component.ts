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
import { AuthService } from 'app/core/auth.service';
import { LearningObject } from '@entity';
import { environment } from '@env/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { UnreleaseService } from 'app/admin/core/unrelease.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

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
  showAddEvaluator: boolean;
  showUnreleaseConfirm: boolean;
  showRelevancyDate: boolean;
  showDeleteRevisionConfirmation: boolean;
  showChangeCollection: boolean;

  // flags
  meatballOpen = false;

  hasParents = false;

  private headers = new HttpHeaders();
  constructor(
    private auth: AuthService,
    private unreleaseService: UnreleaseService,
    private statuses: StatusDescriptions,
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    private toaster: ToastrOvenService,
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
   * Toggles the add evaluator modal from showing/hiding
   *
   * @param value True if showing, false otherwise
   */
  toggleAddEvaluatorModal(value: boolean) {
    this.showAddEvaluator = value;
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
    this.unreleaseService.unreleaseLearningObject(this.learningObject.author.username, this.learningObject.id)
      .then(() => {
      this.toaster.success('Success', 'Learning object was successfully unreleased');
      this.learningObject.status = LearningObject.Status.PROOFING;
    }).catch(() => this.toaster.error('Error', 'There was an issue unreleasing this learning object, please try again later'));
  }

  /**
   * Check the logged in user's email verification status
   * @return {boolean} true if loggedin user has verified their email, false otherwise
   */
  get verifiedEmail(): boolean {
    return this.auth.user.emailVerified;
  }

  async checkForParents() {
    const parentUri = `${environment.apiURL}/users/${encodeURIComponent(
      this.learningObject.author.username
      )}/learning-objects/${encodeURIComponent(
      this.learningObject.id
    )}/parents`;

    await this.http.get(
      parentUri,
      { headers: this.headers, withCredentials: true }
      ).pipe(
      take(1),
      catchError(e => of(e))
    ).subscribe(object => {
      if (object && object.length) {
        this.hasParents = true;
      }
    });
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


   deleteRevision() {
    this.unreleaseService.deleteRevision(this.learningObject.author.username, this.learningObject.cuid, this.learningObject.version + 1)
    .then(() => {
      this.toaster.success('Success', 'Learning object unreleased revision deleted successfully');
    }).catch(() => {
      this.toaster.error('Error', 'There was an issue deleting the revision of this learning object, please try again later');
    });
    this.toggleRevisionDelete(false);
   }
  /**
   * Emits a value for checkbox to parent component
   * @param val either the empty string (true) or a minus sign (false)
   */
  toggleSelect(val) {
    this.select.emit(val);
  }

}
