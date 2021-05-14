import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import {
  BuilderStore,
  BUILDER_ACTIONS as actions
} from '../../builder-store.service';
import { LearningObject, User } from '@entity';
import { COPY } from './info-page.copy';
import { Subject } from 'rxjs';
import { LearningObjectValidator } from '../../validators/learning-object.validator';

@Component({
  selector: 'clark-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.scss']
})
export class InfoPageComponent implements OnInit, OnDestroy {
  copy = COPY;
  learningObject: LearningObject;

  selectedLevels: string[] = [];
  academicLevels = Object.values(LearningObject.Level);

  descriptionTouched: boolean;
  descriptionDirty: boolean;

  destroyed$: Subject<void> = new Subject();

  constructor(private store: BuilderStore, public validator: LearningObjectValidator, public cd: ChangeDetectorRef) {}

  ngOnInit() {
    // listen for outcome events and update component stores
    this.store.learningObjectEvent
      .pipe(takeUntil(this.destroyed$))
      .subscribe((payload: LearningObject) => {
        if (payload) {
          // re-initialize our state variables
          this.learningObject = payload;
          this.selectedLevels = payload.levels || [];
        }
      });
  }


  mutateLearningObject(data: any) {
    if (data.description !== this.learningObject.description) {
      this.descriptionDirty = true;
    } else {
      this.descriptionDirty = false;
    }
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
  }

  getContributorAttribution() {
    let attribution = '';
    if (this.learningObject.contributors && this.learningObject.contributors.length >= 3) {
      // 3 or more contributors: 'a, b, and c'
      for (let i = 0; i < this.learningObject.contributors.length; i++) {
        const name = this.capitalizeName(this.learningObject.contributors[i].name);

        attribution += i === this.learningObject.contributors.length - 1 ?
          'and ' + name : name + ', ';
      }
    } else if (this.learningObject.contributors && this.learningObject.contributors.length > 0) {
      // 1 or 2 contributors: 'a' or 'a and b'
      attribution = this.capitalizeName(this.learningObject.contributors[0].name);
      if (this.learningObject.contributors.length === 2) {
        attribution += ' and ' + this.capitalizeName(this.learningObject.contributors[1].name);
      }
    } else {
      // No contributors added
      attribution = 'List of Contributors';
    }
    return attribution;
  }

  private capitalizeName(name) {
    return name.replace(/\b(\w)/g, s => s.toUpperCase());
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
