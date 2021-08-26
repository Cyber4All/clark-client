import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from '../../core/navbar.service';
import { BuilderStore, BUILDER_ERRORS } from './builder-store.service';
import { ActivatedRoute } from '@angular/router';

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
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { LearningObjectValidator } from './validators/learning-object.validator';
import { LearningOutcomeValidator } from './validators/learning-outcome.validator';
import { HistorySnapshot, HistoryService } from 'app/core/history.service';

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
  selector: 'clark-relevancy-builder',
  templateUrl: './relevancy-builder.component.html',
  styleUrls: ['./relevancy-builder.component.scss'],
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
export class RelevancyBuilderComponent implements OnInit, OnDestroy {

  // fires when the component is destroyed
  destroyed$: Subject<void> = new Subject();

  serviceInteraction: boolean;
  showServiceInteraction: boolean;
  removeServiceIndicator: NodeJS.Timer;

  errorMessage: string;

  adminMode: boolean;
  isRevision: boolean;

  showServiceFailureModal = false;

  historySnapshot: HistorySnapshot;

  // tslint:disable-next-line:max-line-length
  constructor(
    public store: BuilderStore,
    private route: ActivatedRoute,
    private nav: NavbarService,
    private validator: LearningObjectValidator,
    public noteService: ToastrOvenService,
    private history: HistoryService
  ) { }

  ngOnInit() {
    this.historySnapshot = this.history.snapshot();

    // listen for route change and grab name parameter if it's there
    this.route.paramMap
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async routeParams => {
        const id = routeParams.get('learningObjectId');
        if (id) {
          await this.store.fetch(id);
        }
      });

    // hides clark nav bar from builder
    this.nav.hide();
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
      case BUILDER_ERRORS.UPDATE_OBJECT:
        this.noteService.error(
          toasterTitle,
          'Unable to update Learning Object',
        );
        break;
      case BUILDER_ERRORS.UPDATE_OUTCOME:
        this.noteService.error(
          toasterTitle,
          'Unable to update Learning Outcome',
        );
        break;
      default:
        break;
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

  ngOnDestroy() {
    // clear subscriptions before component is destroyed
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
