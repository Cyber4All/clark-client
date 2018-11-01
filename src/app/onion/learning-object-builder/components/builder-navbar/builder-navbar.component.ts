import { Component, , OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { BuilderStore } from '../../builder-store.service';
import { AuthService } from 'app/core/auth.service';
import { LearningObjectValidator } from '../../learning-object.validator';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'onion-builder-navbar',
  templateUrl: './builder-navbar.component.html',
  styleUrls: ['./builder-navbar.component.scss'],
  animations: [
    trigger('route', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate('250ms ease', style({ opacity: 1, transform: 'translateY(0px)' }))
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0px)' }),
        animate('300ms ease', style({ opacity: 0, transform: 'translateY(15px)' }))
      ])
    ])
  ]
})
export class BuilderNavbarComponent implements OnDestroy {
  isSaving = false;

  destroyed$: Subject<void> = new Subject();

  constructor(private store: BuilderStore, private auth: AuthService, private validator: LearningObjectValidator) {
    // subscribe to the serviceInteraction observable to display in the client when the application
    // is interacting with the service
    this.store.serviceInteraction$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(params => {
      if (params) {
        this.isSaving = true;
      } else {
        this.isSaving = false;
      }
    });
  }

  canRoute(route: string) {
    switch (route) {
      case 'outcomes':
        return this.validator.saveable();
      case 'materials':
        return !!(this.auth.user.emailVerified && this.validator.saveable());
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
