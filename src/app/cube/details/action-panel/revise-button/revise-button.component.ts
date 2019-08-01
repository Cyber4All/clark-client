import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';
import { Router } from '@angular/router';
import { EditorService } from 'app/core/editor.service';
import { ToasterService } from 'app/shared/toaster';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';

@Component({
  selector: 'clark-revise-button',
  templateUrl: './revise-button.component.html',
  styleUrls: ['./revise-button.component.scss']
})
export class ReviseButtonComponent {
  @Input() learningObject: LearningObject;
  @Input() isRevision: boolean;
  showPopup = false;

  constructor(private router: Router, private service: EditorService, private toasterService: ToasterService) { }

  /**
   * makeRevision handles the user clicking the revise button. If the Learning Object currently has a revision,
   * then the user is navigated to the builder's editor mode with that revision open. Otherwise, when there is no
   * revision, we assume that the Learning Object is released. In this case we open a confirmation dialog that
   * explains the impact of drafting a new revision for a released Learning Object.
   *
   * TODO: This flow must be updated after the implementation of ch26
   */
  makeRevision(): void {
    if (this.learningObject.status !== LearningObject.Status.RELEASED) {
      this.showPopup = true;
    } else {
      this.router.navigate([`/admin/learning-object-builder/${this.learningObject.id}?isRevision=${this.isRevision}`]);
    }
  }

  /**
   * moveToProofing calls the Editor Service changeStatus to set the Learning Object's status to proofing.
   * Triggers when the user confirms that they want to make a revision of a released Learning Object.
   */
  moveToProofing() {
    this.service
      .changeStatus(this.learningObject.id, this.learningObject.author.username, LearningObject.Status.PROOFING)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe(response => {
        if (!(response instanceof HttpErrorResponse)) {
          this.router.navigate([`/admin/learning-object-builder/${this.learningObject.id}`]);
        }
      });
  }

  /**
   * Handles network errors, bad requests, and service failures by notifying the user
   * what went wrong.
   * @param error the error response from the API
   * @returns an Observable with of the error event that was handled.
   */
  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network returned error
      this.toasterService.notify(
        'Network Error',
        `We're having trouble with the network right now. Please check your connection and try again.`,
        'bad',
        'far fa-times'
      );
    } else {
      // TODO: Handle 400 series errors
      if (error.status === 500) {
        this.toasterService.notify(
          'Oops',
          `We're having an issue with our server right now. Please try again later.`,
          'bad',
          'far fa-times'
        );
      }
    }
    return of(error);
  }

}
