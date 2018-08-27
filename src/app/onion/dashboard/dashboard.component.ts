import { ModalService, ModalListElement } from '../../shared/modals';
import { ToasterService } from '../../shared/toaster';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObjectService } from '../core/learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { ChangeDetectorRef } from '@angular/core';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { AuthService } from 'app/core/auth.service';
import { trigger, style, animate, transition } from '@angular/animations';

interface DashboardLearningObject extends LearningObject {
  parents: string[];
}

@Component({
  selector: 'onion-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('buttonEnter', [
      transition(':enter', [
        style({
          'max-width': '0px',
          'padding-left': '0px',
          'padding-right': '0px',
          'margin-left': '0px',
          opacity: 0
        }),
        animate(
          '220ms ease-out',
          style({
            'max-width': '250px',
            'padding-left': '25px',
            'padding-right': '20px',
            'margin-left': '15px',
            opacity: 1
          })
        )
      ]),
      transition(':leave', [
        style({
          'max-width': '250px',
          'padding-left': '25px',
          'padding-right': '20px',
          'margin-left': '15px',
          opacity: 1
        }),
        animate(
          '220ms ease-out',
          style({
            'max-width': '0px',
            'padding-left': '0px',
            'padding-right': '0px',
            'margin-left': '0px',
            opacity: 0
          })
        )
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  @ViewChildren('learningObjectElement') learningObjectElements: ElementRef[];
  public tips = TOOLTIP_TEXT;
  learningObjects: DashboardLearningObject[] = [];
  focusedLearningObject: LearningObject; // learning object that has a popup up menu on display for it
  selected: Map<string, { index: number; object: LearningObject }> = new Map();
  hidden: Map<string, { reason: string; object: LearningObject }> = new Map();
  allSelected = false;
  freezeSelected = false;
  selectingParent = false;
  loading = true;
  freezeFocused = false;

  showCancel = false;
  showSubmit = false;
  allowRowClick = false;

  // these functions get reassigned as certain events take place in the dashboard
  cancelAction = () => {};
  rowClick = () => {};
  submitAction = () => {};

  constructor(
    private learningObjectService: LearningObjectService,
    private router: Router,
    private modalService: ModalService,
    private notificationService: ToasterService,
    private app: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    this.learningObjects = await this.getLearningObjects() || [];
  }
  /**
   * Fetches and sets LearningObject[]
   *
   * @memberof DashboardComponent
   */
  async getLearningObjects(): Promise<void | LearningObject[]> {
    this.loading = true;
    return this.learningObjectService
      .getLearningObjects()
      .then((learningObjects: LearningObject[]) => {
        this.loading = false;
        // parse through deep copy of returned array
        const arr: DashboardLearningObject[] = Array.from(learningObjects.map(l => {
          l.parents = [];
          return l as DashboardLearningObject;
        }));

        const lengths = ['nanomodule', 'micromodule', 'module', 'unit', 'course'];

        arr.sort((a, b) => {
          return lengths.indexOf(a.length) <= lengths.indexOf(b.length) ? 1 : 0;
        });

        // @ts-ignore typescript doesn't like arr.map...
        const m: Map<string, DashboardLearningObject> = new Map(arr.map(l => [l.id, l]));

        for (let i = 0, l = arr.length; i < l; i++) {
          const lo = arr[i];
          if (lo.children && lo.children.length) {
            for (const c of lo.children as DashboardLearningObject[]) {
              m.get(c.id).parents ? m.get(c.id).parents.push(lo.name) : m.get(c.id).parents = [lo.name];
            }
          }
        }

        return learningObjects as DashboardLearningObject[];
      })
      .catch(err => {
        this.loading = false;
        return Promise.reject('');
      });
  }

  /**
   * Opens the learning object builder component and populates it with the active learning object
   */
  edit() {
    this.router.navigate([
      '/onion/learning-object-builder',
      this.focusedLearningObject.name
    ]);
  }

  /**
   * Deletes the learning object from the focuedLearningObject parameter if selected = false;
   * If selected = true, deletes all Learning Objects
   * from the selected array.
   *
   * @memberof DashboardComponent
   */
  delete(multiple = false) {
    this.modalService
      .makeDialogMenu(
        'DeleteConfirmation',
        'Are you sure?',
        'You cannot undo this action!',
        false,
        'title-bad',
        'center',
        [
          new ModalListElement(
            'Yup, do it!<i class="far fa-trash-alt"></i>',
            'accept',
            'bad'
          ),
          new ModalListElement(
            'No wait!<i class="far fa-undo-alt"></i>',
            'reject',
            'neutral on-white'
          )
        ]
      )
      .subscribe(val => {
        if (val === 'accept') {
          if (!multiple) {
            this.learningObjectService
              .delete(this.focusedLearningObject.name)
              .then(async () => {
                this.notificationService.notify(
                  'Done!',
                  'New Learning Object(s) deleted!',
                  'good',
                  'far fa-times'
                );
                this.learningObjects = await this.getLearningObjects() || [];
              })
              .catch(async(err) => {
                this.learningObjects = await this.getLearningObjects() || [];
              });
          } else {
            this.learningObjectService
              // TODO: Verify selected is an array of names
              .deleteMultiple(
                Array.from(this.selected.values()).map(s => s.object.name)
              )
              .then(async () => {
                this.clearSelected();
                this.notificationService.notify(
                  'Done!',
                  'New Learning Object(s) deleted!',
                  'good',
                  'far fa-times'
                );
                this.learningObjects = await this.getLearningObjects() || [];
              })
              .catch(err => {});
          }
        }
      });
  }

  async togglePublished() {
    try {
      await this.learningObjectService.togglePublished(
        this.focusedLearningObject
      );
      this.learningObjects = await this.getLearningObjects() || [];
    } catch (e) {
      const err = e._body
        ? e._body
        : 'Server error occured. Please try again later';
      this.notificationService.notify(
        'Could not publish Learning Object.',
        `${err}`,
        'bad',
        'far fa-times'
      );
    }
  }

  /**
   * Opens the learning object builder component
   */
  newLearningObject() {
    this.router.navigate(['/onion/learning-object-builder']);
  }

  /**
   * Fired on select of a Learning Object, takes the object and either adds to the list of selected Learning Objects
   * @param l Learning Object to be selected
   */
  selectLearningObject(l: LearningObject, index: number) {
    if (!this.freezeSelected) {
      this.selected.set(l.id, { index, object: l });
      this.app.detectChanges();

      if (
        this.selected.size === this.learningObjects.length &&
        !this.allSelected
      ) {
        this.allSelected = true;
      }
    }
  }

  /**
   * Fired on select of a Learning Object, takes the object and removes it from the list of selected Learning Objects
   * @param l Learning Object to be deselected
   */
  deselectLearningObject(l: LearningObject) {
    if (!this.freezeSelected) {
      this.selected.delete(l.id);
      this.app.detectChanges();

      if (
        this.selected.size < this.learningObjects.length &&
        this.allSelected
      ) {
        this.allSelected = false;
      }
    }
  }

  /**
   * Returns a boolean that indicates whether the learning object with the specified name is selected
   * @param name of the learning object in question
   */
  objectIsSelected(id: string): boolean {
    return this.selected.get(id) ? true : false;
  }

  /**
   * Selects all learning objects (duh)
   */
  selectAll(force: boolean = false) {
    if ((!this.freezeSelected && !this.freezeFocused) || force) {
      this.allSelected = !this.allSelected;
      if (this.allSelected) {
        // @ts-ignore
        this.selected = new Map(this.learningObjects.map((x, i) => [x.id, { index: i, object: x }]));
      } else {
        this.selected = new Map();
      }
    }
  }

  clearSelected(force: boolean = false) {
    if (!this.allSelected) {
      this.selected = new Map();
    } else {
      this.selectAll(force);
    }
  }

  /**
   * Creates dashboard learning object popup (context menu) when clicking on one of the options buttons in a row
   *
   * @param {any} event click event
   * @param {any} learningObject clicked learning object
   * @memberof DashboardComponent
   */
  makeContextMenu(event, learningObject: LearningObject) {
    this.focusedLearningObject = learningObject;
    const list: Array<ModalListElement> = [
      new ModalListElement('<i class="far fa-edit"></i>Edit', 'edit')
    ];

    if (learningObject.length !== 'nanomodule') {
      list.push(
        new ModalListElement(
          '<i class="far fa-project-diagram"></i>Edit Children',
          'children'
        )
      );
    }

    if (this.auth.user.emailVerified) {
      list.push(
        new ModalListElement(
          '<i class="far fa-upload"></i>Manage Materials',
          'upload'
        )
      );
    }

    if (!learningObject.published && this.auth.user.emailVerified) {
      list.push(
        new ModalListElement(
          '<i class="far fa-eye"></i>Publish',
          'toggle published'
        )
      );
    } else if (this.auth.user.emailVerified) {
      list.push(
        new ModalListElement(
          '<i class="far fa-eye-slash"></i>Unpublish',
          'toggle published'
        )
      );
      list.push(
        new ModalListElement(
          '<i class="far fa-cube"></i>View in CUBE',
          'view details'
        )
      );
    }
    list.push(
      new ModalListElement(
        '<i class="far fa-trash-alt"></i>Delete',
        'delete',
        'bad'
      )
    );

    this.modalService
      .makeContextMenu(
        'LearningObjectContext',
        'small',
        list,
        true,
        event.currentTarget
      )
      .subscribe(val => {
        switch (val) {
          case 'edit':
            this.edit();
            break;
          case 'children':
            this.startAddChildren();
            break;
          case 'delete':
            this.delete();
            break;
          case 'upload':
            this.router.navigate([
              '/onion/content/upload/' + this.focusedLearningObject.name
            ]);
            break;
          case 'toggle published':
            this.togglePublished();
            break;
          case 'view details':
            this.router.navigate([
              `/details/${this.focusedLearningObject.author.username}/${
                this.focusedLearningObject.name
              }`
            ]);
            break;
          default:
            break;
        }
      });
  }

  startAddChildren(editing: boolean = false) {
    this.showCancel = this.showSubmit = this.freezeFocused = true;

    // set action for cancel buton
    this.cancelAction = () => {
      this.cancelAddChildren(true);
    };

    const lengths = ['nanomodule', 'micromodule', 'module', 'unit', 'course'];

    // set action for submitAction
    this.submitAction = () => {
      this.finishAddChildren();
    };

    // reinit selected Map
    this.clearSelected(true);

    // if we're editing the children (or setting vs adding) set selected Map equal to the focused object's children
    if (
      this.focusedLearningObject.children &&
      this.focusedLearningObject.children.length
    ) {
      for (let i = 0, l = this.focusedLearningObject.children.length; i < l; i++) {
        const c = this.focusedLearningObject.children[i] as LearningObject;
        this.selected.set(c.id, { index: 0, object: c });
      }
    }

    // loop through the list of learning objects and hide objects that aren't applicable for the current action
    for (let i = 0, l = this.learningObjects.length; i < l; i++) {
      const lo = this.learningObjects[i];

      // so hide all learning objects that are bigger than the parent
      if (
        lengths.indexOf(lo.length) >=
          lengths.indexOf(this.focusedLearningObject.length) &&
        lo.id !== this.focusedLearningObject.id
      ) {
        this.hidden.set(lo.id, { reason: 'children', object: lo });
      }
    }
  }

  async finishAddChildren() {
    const names = Array.from(this.selected.values()).map(l => l.object.name);

    // create a deep copy of the array resulting from iterating the list of current children and mapping their names
    const current: string[] = Array.from((this.focusedLearningObject.children as LearningObject[]).map(l => l.name));

    // check if no changes
    if (JSON.stringify(current) === JSON.stringify(names)) {
      // no changes
      this.clearSelected(true);
      this.cancelAddChildren();
      return;
    } else {
      let confirmationMessage: string;
      const [additions, removals] = this.parseChildrenChanges(names, current);

      if (additions.length || removals.length !== current.length) {
        const [addMessage, removeMessage] = this.buildAddRemoveMessages(additions, removals);

          confirmationMessage = `Just to confirm, you want to ${addMessage} ${removeMessage} '${
          this.focusedLearningObject.name
        }'?`;
      } else {
        confirmationMessage = `Just to confirm, you want to remove all children from '${
          this.focusedLearningObject.name
        }'?`;
      }

      const confirmation = await this.modalService
        .makeDialogMenu(
          'confirmChildren',
          'Confirm object\'s children',
          confirmationMessage,
          false,
          undefined,
          'center',
          [
            new ModalListElement(
              'Confirm! <i class="far fa-check"></i>',
              'confirm',
              'good'
            ),
            new ModalListElement(
              'Never mind <i class="far fa-times"></i>',
              'cancel',
              'bad'
            )
          ]
        )
        .toPromise();

      if (confirmation === 'confirm') {
        const ids = this.learningObjects.filter(l => names.includes(l.name)).map(l => l.id);
        this.learningObjectService.setChildren(this.focusedLearningObject.name, ids).then(val => {
          this.notificationService.notify(
            'Success!',
            'Learning Object\'s children updated successfully!',
            'good',
            'far fa-check'
          );

          this.clearSelected(true);
          this.cancelAddChildren();

          this.getLearningObjects().then(objects => { this.learningObjects = objects; });
        }).catch(error => {
          console.log(error);

          this.notificationService.notify(
            'Error!', 'An error occurred and the Learning Object\'s children could not be updated', 'bad', 'far fa-times'
          );
        });
      }
    }
  }

  cancelAddChildren(shouldClear: boolean = false) {
    this.freezeSelected = this.freezeFocused = false;
    this.showCancel = this.showSubmit = this.allowRowClick = this.selectingParent = false;
    this.cancelAction = this.rowClick = this.submitAction = () => {};

    this.hidden.forEach(x => {
      if (x.reason === 'children') {
        this.hidden.delete(x.object.id);
      }
    });

    if (shouldClear) {
      this.clearSelected(true);
    }
  }

  /**
   * Takes a list of changes (the currently selected map of LO names) and a list of the already existing LO names in the
   * focusedObject's children and returns an array of names that were added and another array of names that were removed
   * @param changes
   * @param exisiting
   */
  parseChildrenChanges(changes: string[], exisiting: string[]): [string[], string[]] {
    // store additions here
    const additions = [];

    // store removals here
    let removals = [];

    const spliceIndexes: number[] = [];

    // loop through currently selected ids and determine if they were added
    for (let i = 0, l = changes.length; i < l; i++) {
      if (changes.includes(exisiting[i])) {
        // this was unchanged, store index to remove after iteration complete
        spliceIndexes.push(i);
      } else {
        // must be an addition
        additions.push(changes[i]);
      }
    }

    exisiting = exisiting.filter((_, i) => !spliceIndexes.includes(i));

    // at this point, anything left in the current array is a removal
    removals = exisiting;

    return [additions, removals];
  }

  /**
   * Takes two arrays of LO names, one of additions and one of removals, and 
   * constructs a gramatically correct addition and subtraction message
   */
  buildAddRemoveMessages(additions: string[], removals: string[]): [string, string] {
    const addMessage = additions.length
      ? `add ${
        additions.length > 1 ?
          additions.slice(0, additions.length - 1).map(n => '\'' + n + '\'').join(', ') + ' and \'' + additions[additions.length - 1] + '\''
          : '\'' + additions[additions.length - 1] + '\''} ${removals.length ? '' : 'to'
        } `
      : '';

    const removeMessage = removals.length
      ? `and remove ${
        removals.length > 1 ?
          removals.slice(0, removals.length - 1).map(n => '\'' + n + '\'').join(', ') + ' and \'' + removals[removals.length - 1] + '\''
          : '\'' + removals[removals.length - 1] + '\''} from `
      : '';

      return [addMessage, removeMessage];
  }

  objectChildrenNames(learningObject: LearningObject): string[] {
    if (learningObject.children && learningObject.children.length) {
      return (learningObject.children as LearningObject[]).map(l => l.name);
    } else {
      return [];
    }
  }
}
