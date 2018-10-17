import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil, map, filter } from 'rxjs/operators';
import { BuilderStore, BUILDER_ACTIONS as actions } from '../../builder-store.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { COPY } from './info-page.copy';
import { Subject } from 'rxjs/Subject';
import { AcademicLevel } from '@cyber4all/clark-entity/dist/learning-object';

@Component({
  selector: 'clark-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.scss']
})
export class InfoPageComponent implements OnInit, OnDestroy {
  copy = COPY;
  learningObject: LearningObject;

  selectedLevels: string[] = [];
  academicLevels = Object.values(AcademicLevel);

  destroyed$: Subject<void> = new Subject();

  constructor(private store: BuilderStore) { }

  ngOnInit() {
    // listen for outcome events and update component stores
    this.store.learningObjectEvent.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((payload: LearningObject) => {
      if (payload) {
        this.learningObject = payload;
        this.selectedLevels = payload.levels;
      }
    });
  }

  mutateLearningObject(data: any) {
    this.store.execute(actions.MUTATE_OBJECT, data);
  }

  toggleLevel(level: string) {
    const index = this.selectedLevels.indexOf(level);
    if (index >= 0) {
      this.selectedLevels.splice(index, 1);
    } else {
      this.selectedLevels.push(level);
    }

    this.mutateLearningObject({ levels: this.selectedLevels });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
