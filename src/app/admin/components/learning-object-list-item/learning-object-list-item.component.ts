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

  // fired when the view user option is selected from the context menu
  @Output()
  viewUser: EventEmitter<string> = new EventEmitter();
  // Change status
  @Output()
  changeStatus: EventEmitter<LearningObject> = new EventEmitter();

  statusDescription: string;

  showChangeAuthor: boolean;

  // flags
  meatballOpen = false;

  hasParents = false;

  private headers = new HttpHeaders();
  constructor(
    private auth: AuthService,
    private statuses: StatusDescriptions,
    private cd: ChangeDetectorRef,
    private http: HttpClient,
  ) {}

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

  toggleChangeAuthorModal(value: boolean) {
    this.showChangeAuthor = value;
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

}
