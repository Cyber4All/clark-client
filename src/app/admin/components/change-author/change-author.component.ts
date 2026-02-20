import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LearningObject, User } from '@entity';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChangeAuthorshipService } from 'app/core/learning-object-module/change-authorship/change-authorship.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { UserService } from '../../../core/user-module/user.service';
import { LEARNING_OBJECT_ROUTES } from 'app/core/learning-object-module/learning-object/learning-object.routes';
import { LearningObjectService } from 'app/core/learning-object-module/learning-object/learning-object.service';
import { OrganizationStore } from 'app/core/organization-module/organization.store';

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
    private changeAuthorshipService: ChangeAuthorshipService,
    private learningObjectService: LearningObjectService,
    public toaster: ToastrOvenService,
    private userService: UserService,
    public orgStore: OrganizationStore,
  ) { }


  async ngOnInit() {
    this.children = await this.learningObjectService.getLearningObjectChildren(this.highlightedLearningObject.id);
    this.hasChildren = this.children.length > 0;
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

  async changeAuthor() {
    const author: User = await this.userService.getUser(this.highlightedLearningObject.author._username);
    this.changeAuthorshipService.changeAuthorship(
      author.userId,
      this.highlightedLearningObject.id,
      this.selectedAuthor.userId).then(
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
