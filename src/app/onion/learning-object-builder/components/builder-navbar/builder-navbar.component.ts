import { Component, OnDestroy, Input } from '@angular/core';
import { BuilderStore } from '../../builder-store.service';
import { AuthService } from 'app/core/auth.service';
import { LearningObjectValidator } from '../../validators/learning-object.validator';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from 'app/shared/toaster';
import { CollectionService, Collection } from 'app/core/collection.service';
import { LearningObject } from '@entity';
import { ContextMenuService } from 'app/shared/contextmenu/contextmenu.service';

@Component({
  selector: 'onion-builder-navbar',
  templateUrl: './builder-navbar.component.html',
  styleUrls: ['./builder-navbar.component.scss']
})
export class BuilderNavbarComponent implements OnDestroy {
  isSaving: boolean;
  editing: boolean;
  submissionError: boolean;

  showSubmission: boolean;
  showSubmissionOptions: boolean;

  // this is the id of the context menu after being registered with the ContextMenuService
  submissionOptionsMenu: string;

  learningObject: LearningObject;
  collection: Collection;

  initialRouteStates: Map<string, boolean> = new Map();
  firstRouteChanges: Set<string> = new Set();
  routesClicked: Set<string> = new Set();

  // map of state strings to icons and tooltips
  states: Map<string, { tip: string }>;

  destroyed$: Subject<void> = new Subject();

  @Input() adminMode = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private toasterService: ToasterService,
    private collectionService: CollectionService,
    private contextMenuService: ContextMenuService,
    public validator: LearningObjectValidator,
    public store: BuilderStore
  ) {
    // subscribe to the serviceInteraction observable to display in the client when the application
    // is interacting with the service
    this.store.serviceInteraction$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(params => {
        if (params) {
          this.isSaving = true;
        } else {
          this.isSaving = false;
        }
      });

    this.store.learningObjectEvent
      .pipe(
        filter(val => typeof val !== 'undefined'),
        takeUntil(this.destroyed$)
      )
      .subscribe(val => {
        this.learningObject = val;
        this.getCollectionName();
      });

    // check to see if we're editing a learning object or creating a new one by checking for an id in the url
    this.editing = !!this.activatedRoute.snapshot.params['learningObjectId'];
  }

  /**
   * Toggles display of a context menu for the submitted options
   *
   * @param {MouseEvent} event
   * @memberof BuilderNavbarComponent
   */
  toggleSubmissionOptionsMenu(event: MouseEvent) {
    if (this.submissionOptionsMenu) {
      if (event && !this.showSubmissionOptions) {
        this.contextMenuService.open(
          this.submissionOptionsMenu,
          event.currentTarget as HTMLElement,
          { top: 5, left: 0 }
        );
      } else {
        this.contextMenuService.destroy(this.submissionOptionsMenu);
      }

      this.showSubmissionOptions = !this.showSubmissionOptions;
    } else {
      console.error('Error! Attempted to open an unregistered context menu');
    }
  }

  /**
   * Returns a boolean indicating whether a route should be shown in the navbar based on validation and email verification
   *
   * @param {'outcomes' | 'materials'} route
   * @returns
   * @memberof BuilderNavbarComponent
   */
  canRoute(route: string) {
    let result: boolean;

    switch (route) {
      case 'outcomes':
        result = this.validator.saveable && this.store.touched;
        break;
      case 'materials':
        result = !!(
          this.auth.user.emailVerified &&
          this.validator.saveable &&
          this.store.touched
        );
        break;
    }

    if (!this.initialRouteStates.has(route)) {
      // set the initial route state, used for checking whether a route is "new" or not
      this.initialRouteStates.set(route, result);
    }

    if (result) {
      // as soon as a route becomes active, add it to the firstRouteChanges set.
      // used for checking whether a route is "new" or not
      this.firstRouteChanges.add(route);
    }

    return result;
  }

  /**
   * Returns whether the passed route is "new", aka was the route disabled due to validation but is now enabled and hasn't been navigated to
   * @param {string} route
   * @returns {boolean}
   * @memberof BuilderNavbarComponent
   */
  isNewRoute(route: string) {
    return (
      !this.initialRouteStates.get(route) &&
      this.firstRouteChanges.has(route) &&
      !this.routesClicked.has(route)
    );
  }

  /**
   * Add the passed route to the set of clicked routes
   * @param {string} route
   * @memberof BuilderNavbarComponent
   */
  triggerRouteClick(route: string) {
    this.routesClicked.add(route);
  }

  /**
   * Makes a call to the BuilderStore to begin the submission process
   *
   * @memberof BuilderNavbarComponent
   */
  triggerSubmit() {
    const errorPages = new Map<string, boolean>();
    const currentRoute = this.activatedRoute.snapshot.children[0].url[0].path;

    if (!this.store.canSubmit()) {
      // check for outcome errors
      if (
        this.validator.get('outcomes') ||
        this.validator.outcomeValidator.errors.submitErrors.size
      ) {
        errorPages.set('outcomes', true);
      }

      // check for submission errors not related to outcomes
      if (
        this.validator.errors.submitErrors.size > 1 ||
        (this.validator.errors.submitErrors.size === 1 &&
          !this.validator.get('outcomes'))
      ) {
        errorPages.set('info', true);
      }

      // notify user
      this.toasterService.notify(
        'Error!',
        'Please correct the errors and try again!',
        'bad',
        'far fa-times'
      );

      if (errorPages.size && !errorPages.get(currentRoute)) {
        // we've found errors on other pages and none on our current page, so route to that page
        const target = ['./' + Array.from(errorPages.keys())[0]];

        if (
          target[0] === './outcomes' &&
          this.validator.outcomeValidator.errors.submitErrors.size
        ) {
          // route directly to bad outcome if possible
          target.push(
            Array.from(
              this.validator.outcomeValidator.errors.submitErrors.keys()
            )[0]
          );
        }

        this.router.navigate(target, { relativeTo: this.activatedRoute });
      }
    } else {
      this.showSubmission = true;
    }
  }

  /**
   * Build the states map for the status tooltips and icons
   *
   * @memberof BuilderNavbarComponent
   */
  buildTooltip() {
    this.collectionService
      .getCollection(this.learningObject.collection)
      .then(val => {
        this.states = new Map([
          [
            LearningObject.Status.REJECTED,
            {
              tip:
                'This learning object was rejected. Contact your review team for further information'
            }
          ],
          [
            LearningObject.Status.RELEASED,
            {
              tip:
                'This learning object is published to the ' +
                (val ? val.name : '') +
                ' collection and can be browsed for.'
            }
          ],
          [
            LearningObject.Status.REVIEW,
            {
              tip:
                'This object is currently under review by the ' +
                (val ? val.name : '') +
                ' review team, It is not yet published and cannot be edited until the review process is complete.'
            }
          ],
          [
            LearningObject.Status.WAITING,
            {
              tip:
                'This learning object is waiting to be reviewed by the next available reviewer from the ' +
                (val ? val.name : '') +
                ' review team'
            }
          ],
          [
            LearningObject.Status.UNRELEASED,
            {
              tip:
                'This learning object is visible only to you. Submit it for review to make it publicly available.'
            }
          ]
        ]);
      });
  }

  /**
   * Return a learning object to unpublished status
   */
  cancelSubmission() {
    this.store.cancelSubmission();
  }

  getCollectionName() {
    this.collectionService
      .getCollection(this.learningObject.collection)
      .then(col => {
        this.collection = col;
        this.buildTooltip();
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
