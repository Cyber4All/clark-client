import { Component, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { BuilderStore, BUILDER_ACTIONS } from '../../builder-store.service';
import { AuthService } from 'app/core/auth.service';
import { LearningObjectValidator } from '../../validators/learning-object.validator';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from 'app/shared/toaster';

@Component({
  selector: 'onion-builder-navbar',
  templateUrl: './builder-navbar.component.html',
  styleUrls: ['./builder-navbar.component.scss'],
  animations: [
    trigger('route', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate(
          '250ms ease',
          style({ opacity: 1, transform: 'translateY(0px)' })
        )
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'translateY(0px)' }),
        animate(
          '300ms ease',
          style({ opacity: 0, transform: 'translateY(15px)' })
        )
      ])
    ])
  ]
})
export class BuilderNavbarComponent implements OnDestroy {
  isSaving: boolean;
  showSubmission: boolean;

  destroyed$: Subject<void> = new Subject();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private validator: LearningObjectValidator,
    private toasterService: ToasterService,
    public store: BuilderStore,
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
  }

  /**
   * Returns a boolean indicating whether a route should be shown in the navbar based on validation and email verification
   *
   * @param {'outcomes' | 'materials'} route
   * @returns
   * @memberof BuilderNavbarComponent
   */
  canRoute(route: string) {
    switch (route) {
      case 'outcomes':
        return this.validator.saveable;
      case 'materials':
        return !!(this.auth.user.emailVerified && this.validator.saveable);
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

    this.store.submitForReview().then((canSubmit: boolean) => {
      if (!canSubmit) {
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
        this.toasterService.notify('Error!', 'Please correct the highlighted errors and try again!', 'bad', 'far fa-times');

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
    });
  }

  submitForReview(collection?: string) {
    if (collection) {
      this.store.submitForReview(collection).then(val => {
        this.showSubmission = false;
      }).catch(error => {
        console.error(error);
        this.showSubmission = false;
      });
    } else {
      console.error('Error! No collection specified!');
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
