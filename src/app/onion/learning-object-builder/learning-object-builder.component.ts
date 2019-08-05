import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from '../../core/navbar.service';
import { BuilderStore, BUILDER_ERRORS } from './builder-store.service';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject } from 'rxjs';
import {
  trigger,
  transition,
  state,
  style,
  animate,
  query,
  stagger,
  animateChild
} from '@angular/animations';
import { ToasterService } from 'app/shared/modules/toaster';
import { LearningObjectValidator } from './validators/learning-object.validator';
import { LearningOutcomeValidator } from './validators/learning-outcome.validator';
import { AuthService } from 'app/core/auth.service';
import { LearningObject } from '@entity';
import { environment } from '@env/environment.prod';

export const builderTransitions = trigger('builderTransition', [
  transition('* => *', [
    // hide all entering columns and the navbar if it's entering
    query(
      ':enter .column, :enter .builder-navbar-wrapper',
      [style({ opacity: 0 })],
      { optional: true }
    ),
    // animate any leaving columns off staggered
    query(
      ':leave .column',
      [
        stagger('150ms', [
          style({ transform: 'translateY(0px)', opacity: 1 }),
          animate(
            '250ms ease',
            style({ transform: 'translateY(-200px)', opacity: 0 })
          )
        ])
      ],
      { optional: true }
    ),
    // animate the entering navbar on
    query(
      ':enter .builder-navbar-wrapper',
      [
        style({ transform: 'translateY(-200px)', opacity: 0 }),
        animate(
          '300ms ease',
          style({ transform: 'translateY(0px)', opacity: 1 })
        )
      ],
      { optional: true }
    ),
    // animate any entering columns on staggered
    query(
      ':enter .column',
      [
        stagger('150ms ease', [
          style({ transform: 'translateY(-200px)', opacity: 0 }),
          animate(
            '300ms ease',
            style({ transform: 'translateY(0px)', opacity: 1 })
          )
        ])
      ],
      { optional: true }
    ),
    query('@outcome', [animateChild()], { optional: true })
  ])
]);

// This component sets its own page title within the builder store
@Component({
  selector: 'clark-learning-object-builder',
  templateUrl: './learning-object-builder.component.html',
  styleUrls: ['./learning-object-builder.component.scss'],
  animations: [
    trigger('serviceInteraction', [
      state('open', style({ opacity: '1', transform: 'translateY(-20px)' })),
      state('closed', style({ opacity: '0', transform: 'translateY(0px)' })),
      transition('* => *', animate('300ms ease'))
    ]),
    builderTransitions
  ],
  // these are provided here so that they'll be destroyed when navigating away
  providers: [BuilderStore, LearningObjectValidator, LearningOutcomeValidator]
})
export class LearningObjectBuilderComponent implements OnInit, OnDestroy {
  // fires when the component is destroyed
  destroyed$: Subject<void> = new Subject();

  serviceInteraction: boolean;
  showServiceInteraction: boolean;
  removeServiceIndicator: NodeJS.Timer;

  errorMessage: string;

  adminMode: boolean;

  showServiceFailureModal = false;
  adminDashboardURL = environment.adminAppUrl;

  // tslint:disable-next-line:max-line-length
  constructor(
    private store: BuilderStore,
    private route: ActivatedRoute,
    private router: Router,
    private nav: NavbarService,
    private builderStore: BuilderStore,
    private validator: LearningObjectValidator,
    public noteService: ToasterService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // listen for route change and grab name parameter if it's there
    this.route.paramMap
      .pipe(takeUntil(this.destroyed$))
      .subscribe(routeParams => {
        const id = routeParams.get('learningObjectId');

        // if name parameter found, instruct store to fetch full learning object
        if (id) {
          this.store.fetch(id).then(learningObject => {
            if (learningObject.status === LearningObject.Status.RELEASED) {
              this.router.navigate(['onion/dashboard'], { queryParams: { status: 403 } });
            } else {
              // redirect user to dashboard if the object is in the working stage
              if (this.isInReviewStage(learningObject) && !this.authService.hasEditorAccess) {
                this.router.navigate(['onion/dashboard']);
              } else {
                this.setBuilderMode(learningObject);
              }
            }
          });
        } else {
          // otherwise instruct store to initialize and store a blank learning object
          this.store.makeNew();
        }
    });

    this.builderStore.serviceInteraction$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(val => {
        if (val === true) {
          clearTimeout(this.removeServiceIndicator);
          this.serviceInteraction = true;
          this.showServiceInteraction = true;
        } else if (val === false) {
          this.serviceInteraction = false;

          this.removeServiceIndicator = setTimeout(() => {
            this.showServiceInteraction = false;
          }, 3000);
        } else {
          // If value is not explicitly true or false then an error occurred that will be handled by service error handler
          this.showServiceInteraction = false;
          this.serviceInteraction = false;
        }
      });

    this.builderStore.serviceError$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(e => this.handleBuilderError(e));

    // hides clark nav bar from builder
    this.nav.hide();
  }

  /**
   * Sets adminMode to true if user is admin or editor and is not the author
   *
   * @private
   * @param {LearningObject} object
   * @memberof LearningObjectBuilderComponent
   */
  private setBuilderMode(object: LearningObject): void {
    this.adminMode =
      this.authService.isAdminOrEditor() &&
      object.author.username !== this.authService.username;
  }

  /**
   * Handles builder errors by displaying error feedback to the user via toaster or modal if there is a service failure
   *
   * @private
   * @param {BUILDER_ERRORS} error
   * @memberof LearningObjectBuilderComponent
   */
  private handleBuilderError(error: BUILDER_ERRORS) {
    const toasterTitle = 'Error!';
    const toasterClass = 'bad';
    const toasterIcon = 'far fa-times';
    switch (error) {
      case BUILDER_ERRORS.SERVICE_FAILURE:
        this.showServiceFailureModal = true;
        break;
      case BUILDER_ERRORS.CREATE_OBJECT:
        this.noteService.notify(
          toasterTitle,
          'Unable to create Learning Object',
          toasterClass,
          toasterIcon
        );
        break;
      case BUILDER_ERRORS.CREATE_OUTCOME:
        this.noteService.notify(
          toasterTitle,
          'Unable to create Learning Outcome',
          toasterClass,
          toasterIcon
        );
        break;
      case BUILDER_ERRORS.DELETE_OUTCOME:
        this.noteService.notify(
          toasterTitle,
          'Unable to delete Learning Outcome',
          toasterClass,
          toasterIcon
        );
        break;
      case BUILDER_ERRORS.FETCH_OBJECT_MATERIALS:
        this.noteService.notify(
          toasterTitle,
          'Unable to load materials',
          toasterClass,
          toasterIcon
        );
        break;
      case BUILDER_ERRORS.SUBMIT_REVIEW:
        this.noteService.notify(
          toasterTitle,
          'Unable to submit Learning Object for review',
          toasterClass,
          toasterIcon
        );
        break;
      case BUILDER_ERRORS.UPDATE_FILE_DESCRIPTION:
        this.noteService.notify(
          toasterTitle,
          'Unable to update file description',
          toasterClass,
          toasterIcon
        );
        break;
      case BUILDER_ERRORS.UPDATE_OBJECT:
        this.noteService.notify(
          toasterTitle,
          'Unable to update Learning Object',
          toasterClass,
          toasterIcon
        );
        break;
      case BUILDER_ERRORS.UPDATE_OUTCOME:
        this.noteService.notify(
          toasterTitle,
          'Unable to update Learning Outcome',
          toasterClass,
          toasterIcon
        );
        break;
      case BUILDER_ERRORS.ADD_FILE_META:
        this.noteService.notify(
          toasterTitle,
          'Unable to add file(s)',
          toasterClass,
          toasterIcon
        );
        break;
      default:
        break;
    }
  }

  /**
   * Routes user to onion dashboard or admin dashboard depending on builder mode
   *
   * @memberof LearningObjectBuilderComponent
   */
  routeToDashboard() {
    this.showServiceFailureModal = false;
    if (!this.adminMode) {
      this.router.navigate(['/onion/dashboard']);
    } else {
      window.location.href = this.adminDashboardURL;
    }
  }

  get errorState(): boolean {
    this.errorMessage = this.validator.nextError;

    return (
      !this.validator.saveable ||
      (this.validator.submissionMode && !this.validator.submittable)
    );
  }

  getState(outlet: any) {
    return outlet.activatedRouteData.state;
  }

  /**
   * Determines whether or not a Learning Object is in the Review Stage.
   * @param object the Learning Object in question.
   */
  private isInReviewStage(object): boolean {
    return object.status.includes('waiting') && object.status.includes('review') && object.status.includes('proofing');
  }

  ngOnDestroy() {
    // clear subscriptions before component is destroyed
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
