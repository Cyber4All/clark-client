import { Component, Input } from '@angular/core';
import { LearningObject } from '@entity';
import { Router } from '@angular/router';
import { EditorService } from 'app/core/editor.service';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ToasterService } from 'app/shared/toaster';
import { of } from 'rxjs';

@Component({
  selector: 'clark-revise-button',
  template: `
    <button
      *ngIf="learningObject.status !== 'released'"
      class="button neutral"
      (click)="makeRevision()"
      aria-label="Clickable Revise button">
      Revise
    </button>
    <button
      *ngIf="learningObject.status === 'released'"
      [disabled]="learningObject.status === 'released'"
      class="button neutral"
      aria-label="Released Learning Objects cannot be Revised">
      Revisions not permitted
    </button>
    <clark-popup *ngIf="showPopup" (closed)="showPopup = false">
      <div class="popup-content" #popupInner>
        <div class="popup-header">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p tabindex="0">
          Revising a released Learning Object will change the status on the user's dashboard
          from released to proofing. The user will be able to see this, but will not be able to make any
          edits themselves.
        </p>
        <p tabindex="0"> Are you sure you want to do this? </p>
        <div class="btn-group to-right">
          <button class="button bad" (click)="moveToProofing()" aria-label="Clickable Move to Proofing button"> Move to Proofing </button>
          <button class="button neutral" (click)="showPopup = false;" aria-label="Clickable Cancel button"> Cancel </button>
        </div>
      </div>
    </clark-popup>
  `,
  styleUrls: ['./revise-button.component.scss']
})
export class ReviseButtonComponent {
  @Input() learningObject: LearningObject;
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
      this.router.navigate([`/admin/learning-object-builder/${this.learningObject.id}`]);
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
