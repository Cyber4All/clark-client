import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LearningObject, User } from '@entity';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthorshipService } from '../../core/authorship.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { UserService } from '../../../../app/core/user.service';
import { titleCase } from 'title-case';

@Component({
  selector: 'clark-change-author',
  templateUrl: './change-author.component.html',
  styleUrls: ['./change-author.component.scss']
})
export class ChangeAuthorComponent implements OnInit {

  finalStage = false;
  hasChildren = false;
  selectAuthorFailure: string;
  consentGiven = false;
  failureTimer;
  selectedAuthor: User;
  @Input() highlightedLearningObject: LearningObject;
  @Input() statusDescription;
  @Output() close: EventEmitter<void> = new EventEmitter();
  private headers = new HttpHeaders();
  children: LearningObject[];

  constructor(
    private http: HttpClient,
    private authorshipService: AuthorshipService,
    public toaster: ToastrOvenService,
    private userService: UserService,
  ) { }


  async ngOnInit() {
    const childrenUri = `${environment.apiURL}/users/${encodeURIComponent(
      this.highlightedLearningObject.author.username
      )}/learning-objects/${encodeURIComponent(
      this.highlightedLearningObject.id
    )}/children`;

    this.http.get(
      childrenUri,
      { headers: this.headers, withCredentials: true }
      ).pipe(
      take(1),
      catchError(e => of(e))
    ).subscribe(object => {
      if (object && object.length) {
        this.hasChildren = true;
        this.children = object;
      }
    });
  }

  toggleState(renderFinalStage: boolean) {
    if (this.selectedAuthor && this.selectedAuthor.username) {
      this.finalStage = renderFinalStage;
    } else {
      this.renderError();
    }
  }

  setSelectedAuthor(author) {
    if (author) {
      this.selectAuthorFailure = undefined;
      this.selectedAuthor = author;
    }
  }

  toggleConsent(event) {
    if (event.target.checked) {
      this.consentGiven = true;
    } else {
      this.consentGiven = false;
    }
  }

  /**
   * Function to conditionally set the title case of an organization
   *
   * @param organization string of the users affiliated organization
   * @returns string unformated or title cased
   */
  organizationFormat(organization: string) {
    if ( organization.charAt(1) === organization.charAt(1).toUpperCase() ) {
      return organization;
    } else {
      return titleCase(organization);
    }
  }

  async changeAuthor() {
    const author: User = await this.userService.getUser(this.highlightedLearningObject.author.username);
    this.authorshipService.changeAuthorship(
      author,
      this.highlightedLearningObject.id,
      this.selectedAuthor.id).then(
        () => {
          this.toaster.success('Success!', 'Learning Object Author changed.');
          this.close.emit();
        },
        error => {
          this.toaster.error('Error!', 'Unable to change authorship at this time.');
        }
      );
  }

  renderError() {
    this.selectAuthorFailure = 'Please select an author before continuing';

    this.failureTimer = setTimeout(() => {
      this.selectAuthorFailure = undefined;
    }, 4000);
  }
}
