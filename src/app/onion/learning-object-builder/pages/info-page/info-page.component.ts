import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import {
  BuilderStore,
  BUILDER_ACTIONS as actions
} from '../../builder-store.service';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { COPY } from './info-page.copy';
import { Subject } from 'rxjs/Subject';
import { AcademicLevel } from '@cyber4all/clark-entity/dist/learning-object';
import { LearningObjectValidator } from '../../validators/learning-object.validator';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

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

  formGroup = new FormGroup({});

  destroyed$: Subject<void> = new Subject();

  constructor(private store: BuilderStore, public validator: LearningObjectValidator) {}

  ngOnInit() {
    // listen for outcome events and update component stores
    this.store.learningObjectEvent
      .pipe(takeUntil(this.destroyed$))
      .subscribe((payload: LearningObject) => {
        if (payload) {
          // re-initialize our state variables
          this.learningObject = payload;
          this.selectedLevels = payload.levels;

          // re-initialize our form group
          this.formGroup = new FormGroup({
            name: new FormControl(this.learningObject.name, [
              // validate name
              (() => {
                return (control: AbstractControl): { [key: string]: any } | null => {
                  return this.validator.validateName(control.value);
                };
              })()
            ])
          });
        }
      });
  }


  mutateLearningObject(data: any) {
    this.store.execute(actions.MUTATE_OBJECT, data);
  }

  toggleContributor(user: User) {
    let action: number;

    // check to see if this user is already a contributor and either add or remove them
    if (this.learningObject.contributors.map(x => x.username).includes(user.username)) {
      action = actions.REMOVE_CONTRIBUTOR;
    } else {
      action = actions.ADD_CONTRIBUTOR;
    }

    this.store.execute(action, { user });
  }

  toggleLevel(level: string) {
    const index = this.selectedLevels.indexOf(level);
    if (index >= 0) {
      this.selectedLevels.splice(index, 1);
    } else {
      this.selectedLevels.push(level);
    }

    this.mutateLearningObject({ levels: this.selectedLevels });
    this.validator.validateAcademicLevels(this.selectedLevels);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
