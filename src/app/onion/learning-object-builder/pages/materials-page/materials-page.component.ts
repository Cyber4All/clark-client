import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { BuilderStore } from '../../builder-store.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'clark-materials-page',
  templateUrl: './materials-page.component.html',
  styleUrls: ['./materials-page.component.scss']
})
export class MaterialsPageComponent implements OnInit, OnDestroy {

  learningObject: LearningObject;
  destroyed$: Subject<void> = new Subject();

  constructor(private store: BuilderStore) { }

  ngOnInit() {
    this.store.learningObjectEvent.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((object: LearningObject) => {
      if (object) {
        this.learningObject = object;
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
