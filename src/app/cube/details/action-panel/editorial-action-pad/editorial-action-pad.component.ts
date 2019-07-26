import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObject } from '@entity';

/**
 * EditorialActionPadComponent coordinates all editor functionality inside of the
 * action panel. This handles conditionally rendering the relevant buttons for the
 * state of the Learning Object.
 */
@Component({
  selector: 'clark-editorial-action-pad',
  templateUrl: './editorial-action-pad.component.html',
  styleUrls: ['./editorial-action-pad.component.scss']
})
export class EditorialActionPadComponent implements OnInit {

  @Input() hasRevision: boolean;
  @Input() learningObject: LearningObject;
  showRevisionPopup = false;

  // TODO: Make HTTP requests for creating a revision
  // TODO: Route the user to the builder depending on what button they click
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  directRevision(): void {
      if (this.learningObject.status === LearningObject.Status.RELEASED && !this.hasRevision) {
        // should open up the create revision notice popup. The confirm button inside should route to the builder
      } else if (this.learningObject.status === LearningObject.Status.RELEASED && this.hasRevision) {
        // should be the disabled button saying that at a revision currently exists.
      }
  }

}
