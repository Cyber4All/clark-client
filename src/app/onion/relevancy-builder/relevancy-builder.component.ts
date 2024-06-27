import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from '../../core/client-module/navbar.service';
import { BuilderStore } from './builder-store.service';
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
import { HistorySnapshot, HistoryService } from 'app/core/client-module/history.service';

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
  providers: [BuilderStore]
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

  // eslint-disable-next-line max-len
  constructor(
    public store: BuilderStore,
    private route: ActivatedRoute,
    private nav: NavbarService,
    public noteService: ToastrOvenService,
    private history: HistoryService
  ) { }

  ngOnInit() {
    this.historySnapshot = this.history.snapshot();

    // listen for route change and grab name parameter if it's there
    this.route.paramMap
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async routeParams => {
        const cuid = routeParams.get('cuid');
        if (cuid) {
          await this.store.fetch(cuid);
        }
      });

    // hides clark nav bar from builder
    this.nav.hide();
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
