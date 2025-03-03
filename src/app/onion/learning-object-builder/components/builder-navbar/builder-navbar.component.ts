import { Component, OnDestroy, Input } from '@angular/core';
import { BuilderStore } from '../../builder-store.service';
import { AuthService } from 'app/core/auth-module/auth.service';
import { LearningObjectValidator } from '../../validators/learning-object.validator';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { CollectionService, Collection } from 'app/core/collection-module/collections.service';
import { LearningObject } from '@entity';
import { BundlingService } from 'app/core/learning-object-module/bundling/bundling.service';
import { FileService } from 'app/core/learning-object-module/file/file.service';

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

  learningObject: LearningObject;
  collection: Collection;
  statusDescription: string;
  // FIXME: This will need to set based on the data coming back once the service is in place
  revisedVersion = false;

  initialRouteStates: Map<string, boolean> = new Map();
  firstRouteChanges: Set<string> = new Set();
  routesClicked: Set<string> = new Set();

  // map of state strings to icons and tooltips
  states: Map<string, { tip: string }>;

  destroyed$: Subject<void> = new Subject();

  redirectUrl: string;

  @Input() adminMode = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private toasterService: ToastrOvenService,
    private collectionService: CollectionService,
    public validator: LearningObjectValidator,
    public store: BuilderStore,
    private bundlingService: BundlingService,
    public fileService: FileService
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
        this.getCollection();
      });

    // check to see if we're editing a learning object or creating a new one by checking for an id in the url
    this.editing = !!this.activatedRoute.snapshot.params['learningObjectId'];

  }

  /**
   * Toggles display of a context menu for the submitted options
   *
   * @param {boolean} [value] true if menu is open, false otherwise
   * @memberof BuilderNavbarComponent
   */
  toggleSubmissionOptionsMenu(value?: boolean) {
    this.showSubmissionOptions = value;
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
   *
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
   *
   * @param {string} route
   * @memberof BuilderNavbarComponent
   */
  triggerRouteClick(route: string) {
    this.routesClicked.add(route);
  }

  /**
   * Function used to handle actions on exit of learning-object builder
   * 1. Remove any outcomes that have null text
   * 2. Initiate bunlding process on a learning object when changes have been made
   *
   * @var this.store.upload is a toggle string variable to block the 'Back' button if a file upload
   * is not finished. See the builder store for more details.
   */
  async triggerExitProcess(leaveBuilder = true) {
    if (this.adminMode && !leaveBuilder) {
      this.toasterService.alert('Ready to Bundle...', 'This learning object is queued for bundling.');
    }
    // Trigger new PDF generation only if the learning object id exists
    // It may not present when opening the builder for the first time for
    // a new learning object
    if (this.learningObject.id) {
      // This will also bundle the learning object after the README is updated
      Promise.all(await this.fileService.updateReadme(this.learningObject.id));
    }
    // Remove outcomes that have null text
    this.store.removeEmptyOutcomes();
    // Enforcing all files/folders are uploaded prior to leaving the builder (upload = 'true')
    if (this.store.upload !== undefined && this.store.upload !== 'false' && this.store.upload !== 'secondClickBack') {
      // If any data has be changed on the LO, then we need to rebundle
      if (this.store.touched) {
        const lo = this.learningObject as any;
        this.bundlingService.bundleLearningObject(lo._id);
      }
      if (leaveBuilder) {
        this.router.navigate(['/onion/dashboard']);
      }
    } else if (this.store.upload === 'secondClickBack') {
      // User has tried to exit the builder twice during an upload process (upload = 'true')
      this.toasterService.error(
        'Uh-oh!',
        'Looks like your upload is taking a long time. Please remain patient or refresh the page and try again...'
      );
      this.store.toggleUploadComplete('true');
    } else {
      // Users attempt to exit the builder during an upload process (upload = 'false' || 'undefined')
      this.toasterService.warning(
        'Hang On!',
        'We are still uploading your files, please stay on this page until this process is complete.'
      );
      this.store.toggleUploadComplete('secondClickBack');
    }
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
      this.toasterService.error('Error!', 'Please correct the errors and try again!');

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
            (this.collection ? this.collection.name : '') +
            ' collection and can be browsed for.'
        }
      ],
      [
        LearningObject.Status.REVIEW,
        {
          tip:
            'This object is currently under review by the ' +
            (this.collection ? this.collection.name : '') +
            ' review team, It is not yet published and cannot be edited until the review process is complete.'
        }
      ],
      [
        LearningObject.Status.WAITING,
        {
          tip:
            'This learning object is waiting to be reviewed by the next available reviewer from the ' +
            (this.collection ? this.collection.name : '') +
            ' review team'
        }
      ],
      [
        LearningObject.Status.UNRELEASED,
        {
          tip:
            'This learning object is visible only to you. Submit it for review to make it publicly available.'
        }
      ],
      [
        LearningObject.Status.ACCEPTED_MAJOR,
        {
          tip: 'The learning object is in the review process. A reviewer, curator, or editor has asked '
            + 'for major changes before it can be released.'
        }
      ],
      [
        LearningObject.Status.ACCEPTED_MINOR,
        {
          tip: 'The learning object is in the review process. A reviewer, curator, or editor has asked for minor '
            + 'changes before it can be released.'
        }
      ],
    ]);
  }

  /**
   * Return a learning object to unpublished status
   */
  cancelSubmission() {
    this.store.cancelSubmission();
  }

  /**
   * Retrieves the full Collection object from the collection service from the selected abbreviated collection
   *
   * @memberof BuilderNavbarComponent
   */
  getCollection() {
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
