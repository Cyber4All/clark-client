import { Component, OnInit, OnDestroy } from '@angular/core';
import { Guideline } from '@entity';
import { BuilderStore } from '../../builder-store.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'clark-relevancy-outcome-page',
  templateUrl: './outcome-page.component.html',
  styleUrls: ['./outcome-page.component.scss']
})
export class OutcomePageComponent implements OnInit, OnDestroy {
  destroyed$: Subject<void> = new Subject();

  // flags
  activeOutcome: string;
  // passed outcome id from query params
  passedId: string;

  saveable: boolean;

  constructor(
    public store: BuilderStore,
  ) {}

  ngOnInit() { }

  setActiveOutcome(id: string) {
    if (id !== this.activeOutcome) {
      this.activeOutcome = id;
    }
  }

  toggleStandardOutcome(data: {
    standardOutcome: Guideline;
    value: boolean;
  }) {
    const { standardOutcome, value } = data;
    value ?
      this.store.addGuideline(this.activeOutcome, standardOutcome) :
      this.store.removeGuideline(this.activeOutcome, standardOutcome.guidelineId);
  }

  ngOnDestroy() {
    // observable cleanup on component destroy
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
