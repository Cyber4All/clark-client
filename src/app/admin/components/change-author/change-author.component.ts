import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LearningObject, User } from '@entity';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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

  constructor(private http: HttpClient) { }


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

  changeAuthor() {
    console.log('bye');
    this.close.emit();
  }

  renderError() {
    this.selectAuthorFailure = 'Please select an author before continuing';

    this.failureTimer = setTimeout(() => {
      this.selectAuthorFailure = undefined;
    }, 4000);
  }
}
