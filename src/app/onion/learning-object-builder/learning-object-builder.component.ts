import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from '../../core/navbar.service';
import { BuilderStore } from './builder-store.service';
import { ActivatedRoute } from '@angular/router';

import 'rxjs/add/operator/takeUntil';
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
import { ToasterService } from 'app/shared/toaster';
import { LearningObjectValidator } from './validators/learning-object.validator';
import { LearningOutcomeValidator } from './validators/learning-outcome.validator';
import { AuthService } from 'app/core/auth.service';

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
            '300ms ease', style({ transform: 'translateY(0px)', opacity: 1 })
          )
        ])
      ],
      { optional: true }
    ),
    query('@outcome', [animateChild()], { optional: true })
  ])
]);

@Component({
  selector: 'clark-learning-object-builder',
  templateUrl: './learning-object-builder.component.html',
  styleUrls: ['./learning-object-builder.component.scss'],
  animations: [
    trigger('serviceInteraction', [
      state('open', style({ opacity: '1',  transform: 'translateY(-20px)' })),
      state('closed', style({ opacity: '0', transform: 'translateY(0px)' })),
      transition('* => *', animate('300ms ease'))
    ]),
    builderTransitions,
  ],
  // these are provided here so that they'll be destroyed when navigating away
  providers: [BuilderStore, LearningObjectValidator, LearningOutcomeValidator]
})
export class LearningObjectBuilderComponent implements OnInit, OnDestroy {
  // fires when the component is destroyed
  destroyed$: Subject<void> = new Subject();

  serviceInteraction: boolean;
  canShowServiceInteraction: boolean;
  showServiceInteraction: boolean;
  removeServiceIndicator: NodeJS.Timer;

  // tslint:disable-next-line:max-line-length
  constructor(
    private store: BuilderStore,
    private route: ActivatedRoute,
    private nav: NavbarService,
    private builderStore: BuilderStore,
    public noteService: ToasterService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    // listen for route change and grab name parameter if it's there
    this.route.paramMap.takeUntil(this.destroyed$).subscribe(params => {
      const id = params.get('learningObjectId');

      // if name parameter found, instruct store to fetch full learning object
      if (id) {
        this.store.fetch(id);
      } else {
        // otherwise instruct store to initialize and store a blank learning object
        this.store.makeNew();
      }
    });

    this.builderStore.serviceInteraction$.takeUntil(this.destroyed$).subscribe(val => {
      if (val) {
        clearTimeout(this.removeServiceIndicator);
        this.serviceInteraction = true;
        this.showServiceInteraction = true;
      } else {
        this.serviceInteraction = false;

        this.removeServiceIndicator = setTimeout(() => {
          this.showServiceInteraction = false;
        }, 3000);
      }
    });

    // hides clark nav bar from builder
    this.nav.hide();

    setTimeout(() => {
      // TODO this boolean is here as a hack to fix a bug wherein the service interaction popup
      // animates at the same time as the columns and becomes invisible
      this.canShowServiceInteraction = true;
    }, 2000)
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
