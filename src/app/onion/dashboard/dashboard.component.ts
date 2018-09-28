import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { lengths as LengthsSet } from '@cyber4all/clark-taxonomy';
import { AuthService } from 'app/core/auth.service';
import { ToasterService } from '../../shared/toaster/toaster.service';
import { LearningObjectStatus } from '@env/environment';

export interface DashboardLearningObject extends LearningObject {
  status: string;
  parents: string[];
}

@Component({
  selector: 'clark-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  learningObjects: DashboardLearningObject[];

  focusedLearningObject: DashboardLearningObject;
  greetingTime: string; // morning, afternoon, or evening depending on user's clock

  // flags
  loading = false;
  allSelected = false;
  deleteConfirmation: Iterator<any>;

  // collections
  // selected simply means the checkbox next to the object is checked
  selected: Map<string, { index: number; object: LearningObject }> = new Map();
  // hidden means that the object is downloaded byt not visible
  hidden: Map<string, { reason: string; object: LearningObject }> = new Map();
  // frozen means that the object is visible but can't be mutated, EG no meatball menu and no checkbox
  frozen: Map<string, { reason: string; object: LearningObject }> = new Map();

  constructor(
    private learningObjectService: LearningObjectService,
    private cd: ChangeDetectorRef,
    private notificationService: ToasterService,
    public auth: AuthService, // used in markup,
  ) {
    const hours = new Date().getHours();
    if (hours >= 17) {
      this.greetingTime = 'evening';
    } else if (hours >= 12) {
      this.greetingTime = 'afternoon';
    } else {
      this.greetingTime = 'morning';
    }
  }

  async ngOnInit() {
    this.learningObjects = await this.getLearningObjects();
  }

  /**
   * Fetches logged-in user's learning objects from API and builds the hierarchy structure
   *@returns DashboardLearningObject[]
   * @memberof DashboardComponent
   */
  async getLearningObjects(): Promise<DashboardLearningObject[]> {
    this.loading = true;
    return this.learningObjectService
      .getLearningObjects()
      .then((learningObjects: LearningObject[]) => {
        this.loading = false;
        // deep copy list of learningObjects and initialize empty parents array
        const arr: DashboardLearningObject[] = Array.from(
          learningObjects.map(l => {
            l.parents = [];
            if (!l.status) {
              l.status = LearningObjectStatus.UNPUBLISHED;
            }
            return l as DashboardLearningObject;
          })
        );

        const lengths = Array.from(LengthsSet.values());

        arr.sort((a, b) => {
          return lengths.indexOf(a.length) <= lengths.indexOf(b.length) ? 1 : 0;
        });

        const m: Map<string, DashboardLearningObject> = new Map(
          // @ts-ignore typescript doesn't like arr.map...
          arr.map(l => [l.id, l])
        );

        for (let i = 0, l = arr.length; i < l; i++) {
          const lo = arr[i];
          if (lo.children && lo.children.length) {
            for (const c of lo.children as DashboardLearningObject[]) {
              m.get(c.id).parents
                ? m.get(c.id).parents.push(lo.name)
                : (m.get(c.id).parents = [lo.name]);
            }
          }
        }

        return learningObjects as DashboardLearningObject[];
      })
      .catch(err => {
        this.loading = false;
        console.error(err);
        return Promise.reject('');
      });
  }

  /**
   * Decides based on the value whether to select or deselect the learning object
   * @param l learning object to be selected
   * @param value boolean, true if object is selected, false otherwise
   * @param index the index of the learning object in the master array
   */
  toggleSelect(l: DashboardLearningObject, value: boolean, index: number) {
    if (value) {
      this.selectLearningObject(l, index);
    } else {
      this.deselectLearningObject(l);
    }
  }

  /**
   * Selects all learning objects (duh)
   */
  selectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selected = new Map(
        // @ts-ignore
        this.learningObjects.map((x, i) => [x.id, { index: i, object: x }])
      );
      this.cd.detectChanges();
    } else {
      this.selected = new Map();
    }
  }

   /**
   * Fired on select of a Learning Object, takes the object and either adds to the list of selected Learning Objects
   * @param l Learning Object to be selected
   */
  selectLearningObject(l: LearningObject, index: number) {
    this.selected.set(l.id, { index, object: l });
    this.cd.detectChanges();

    if ( this.selected.size === this.learningObjects.length && !this.allSelected ) {
      this.allSelected = true;
    }
  }

  /**
   * Fired on select of a Learning Object, takes the object and removes it from the list of selected Learning Objects
   * @param l Learning Object to be deselected
   */
  deselectLearningObject(l: LearningObject) {
    this.selected.delete(l.id);
    this.cd.detectChanges();

    if (this.selected.size < this.learningObjects.length && this.allSelected) {
      this.allSelected = false;
    }
  }

  /**
   * Forcibly clears the selected map and resets the allSelected variable
   */
  clearSelected() {
    this.selected = new Map();
    this.allSelected = false;
  }


  /**
   * Delete a learning object after asking confirmation.
   *
   * This is a generator function.
   * The confirmation modal is shown from the markup by setting the deleteConfirmation variable
   * to the return value of this function and then immediately calling the .next() function,
   * IE deleteConfirmation = delete(l); deleteConfirmation.next();
   * To confirm or deny the confirmation, call deleteConfirmation.next(true) or deleteConfirmation.next(false)
   * @param objects {DashboardLearningObject[]} list of objects to be deleted
   */
  async *delete(...objects: DashboardLearningObject[]) {
    const confirm = yield;

    if (!confirm) {
      return;
    }

    if (objects.length === 1) {
      // single deletion
      this.learningObjectService
        .delete(objects[0].name)
        .then(async () => {
          this.notificationService.notify(
            'Done!',
            'Learning Object(s) deleted!',
            'good',
            'far fa-check'
          );
          this.learningObjects = await this.getLearningObjects();
        })
        .catch(async err => {
          console.log(err);
        });
    } else {
      // multiple deletion
      this.learningObjectService
      // TODO: Verify selected is an array of names
        .deleteMultiple(
          Array.from(objects.map(s => s.object.name))
        )
        .then(async () => {
          this.clearSelected();
          this.notificationService.notify(
            'Done!',
            'Learning Object(s) deleted!',
            'good',
            'far fa-times'
          );
          this.learningObjects = await this.getLearningObjects();
        })
        .catch(err => {});
    }

    this.deleteConfirmation = undefined;

    return;
  }

}
