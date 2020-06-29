import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { LearningObject, User } from '@entity';

@Component({
  selector: 'clark-change-author',
  templateUrl: './change-author.component.html',
  styleUrls: ['./change-author.component.scss']
})
export class ChangeAuthorComponent implements OnInit {

  finalStage = false;
  selectAuthorFailure: string;
  consentGiven = false;
  failureTimer;
  selectedAuthor: User;
  @Input() highlightedLearningObject: LearningObject;
  @Input() statusDescription;
  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor() { }


  ngOnInit(): void {
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

  renderError() {
    this.selectAuthorFailure = 'Please select an author before continuing';

    this.failureTimer = setTimeout(() => {
      this.selectAuthorFailure = undefined;
    }, 4000);
  }
}
