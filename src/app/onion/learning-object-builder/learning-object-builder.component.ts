import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavbarService } from '../../core/navbar.service';
import { BuilderStore } from './builder-store.service';
import { ActivatedRoute } from '@angular/router';

import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';



@Component({
  selector: 'clark-learning-object-builder',
  templateUrl: './learning-object-builder.component.html',
  styleUrls: ['./learning-object-builder.component.scss'],
})
export class LearningObjectBuilderComponent implements OnInit, OnDestroy {
  // fires when the component is destroyed
  destroyed$: Subject<void> = new Subject();

  constructor( private store: BuilderStore, private route: ActivatedRoute, private nav: NavbarService ) { }

  ngOnInit() {
    // listen for route change and grab name parameter if it's there
    this.route.paramMap.takeUntil(this.destroyed$).subscribe(params => {
      const name = params.get('name');

      // if name parameter found, instruct store to fetch full learning object
      if (name) {
        this.store.fetch(name);
      } else {
        // otherwise instruct store to initialize and store a blank learning object
        this.store.makeNew();
      }
    });

    // hides clark nav bar from builder
    this.nav.hide();
  }

  ngOnDestroy() {
    // clear subscriptions before component is destroyed
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
