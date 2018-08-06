import { ModalService, ModalListElement } from '../../shared/modals';
import { NotificationService } from '../../shared/notifications';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LearningObjectService } from '../core/learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { ChangeDetectorRef } from '@angular/core';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { AuthService } from 'app/core/auth.service';
import { trigger, style, animate, transition } from '@angular/animations';


@Component({
  selector: 'onion-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger(
      'buttonEnter', [
        transition(':enter', [
          style(
            {
                'max-width': '0px',
                'padding-left': '0px',
                'padding-right': '0px',
                'margin-left': '0px',
                opacity: 0
              }
          ),
          animate(
            '220ms ease-out',
            style(
              {
                'max-width': '250px',
                'padding-left': '25px',
                'padding-right': '20px',
                'margin-left': '15px',
                opacity: 1
              }
            ),
          )
        ]),
        transition(':leave', [
          style(
              {
                'max-width': '250px',
                'padding-left': '25px',
                'padding-right': '20px',
                'margin-left': '15px',
                opacity: 1
              }
            ),
          animate(
            '220ms ease-out',
            style(
              {
                'max-width': '0px',
                'padding-left': '0px',
                'padding-right': '0px',
                'margin-left': '0px',
                opacity: 0
              }
            )
          )
        ])
      ]
    )
  ],
})
export class DashboardComponent implements OnInit {
  public tips = TOOLTIP_TEXT;
  learningObjects: LearningObject[] = [];
  focusedLearningObject: LearningObject; // learning object that has a popup up menu on display for it, used by delete and edit functions
  selected: Array<string> = []; // array of all learning objects that are currently selected (checkbox in UI)
  hidden: Map<string, { reason: string, object: LearningObject } > = new Map();
  allSelected = false;
  freezeSelected = false;
  selectingParent = false;
  loading = true;

  showCancel = false;
  allowRowClick = false;

  // these functions get reassigned as certain events take place in the dashboard
  cancelAction = () => {};
  rowClick = () => {};

  constructor(
    private learningObjectService: LearningObjectService,
    private router: Router,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private app: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    this.learningObjects = await this.getLearningObjects();
  }
  /**
   * Fetches and sets LearningObject[]
   *
   * @memberof DashboardComponent
   */
  async getLearningObjects(): Promise<LearningObject[]> {
    this.loading = true;
    return this.learningObjectService
      .getLearningObjects()
      .then(learningObjects => {
        this.loading = false;
        return learningObjects;
      })
      .catch(err => {
        this.loading = false;
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
                this.learningObjects = await this.getLearningObjects();
              })
              .catch(async(err) => {
                this.learningObjects = await this.getLearningObjects();
              });
          } else {
            this.learningObjectService
              // TODO: Verify selected is an array of names
              .deleteMultiple(this.selected)
              .then(async () => {
                this.selected = [];
                this.notificationService.notify(
                  'Done!',
                  'New Learning Object(s) deleted!',
                  'good',
                  'far fa-times'
                );
                this.learningObjects = await this.getLearningObjects();
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
      this.learningObjects = await this.getLearningObjects();
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
  selectLearningObject(l: LearningObject) {
    if (!this.freezeSelected) {
      this.selected.push(l.name);
      this.app.detectChanges();

      if (this.selected.length === this.learningObjects.length && !this.allSelected) {
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
      this.selected.splice(this.selected.indexOf(l.name), 1);
      this.app.detectChanges();

      if (this.selected.length < this.learningObjects.length && this.allSelected) {
        this.allSelected = false;
      }
    }
  }

  /**
   * Returns a boolean that indicates whether the learning object with the specified name is selected
   * @param name of the learning object in question
   */
  objectIsSelected(name: string): boolean {
    return this.selected.includes(name);
  }

  /**
   * Selects all learning objects (duh)
   */
  selectAll() {
    if (!this.freezeSelected) {
      this.allSelected = !this.allSelected;
      if (this.allSelected) {
        this.selected = this.learningObjects.map(x => x.name);
      } else {
        this.selected = [];
      }
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

  startAddChildren() {
    this.freezeSelected = true;
    this.showCancel = this.allowRowClick = this.selectingParent = true;

    // set action for cancel buton
    this.cancelAction = this.cancelAddChildren;

    const lengths = [
      'nanomodule',
      'micromodule',
      'module',
      'unit',
      'course'
    ];
    const selected = this.learningObjects.filter(f => this.selected.includes(f.name));
    const maxLength: number = Math.max(...selected.map(l => lengths.indexOf(l.length)));

    // set action for rowClick
    this.rowClick = () => {
      this.finishAddChildren(selected);
    };

    for (let i = 0, l = this.learningObjects.length; i < l; i++) {
      const lo = this.learningObjects[i];

      if (lengths.indexOf(lo.length) <= maxLength && !this.selected.includes(lo.name)) {
        // hide learning object
        this.hidden.set(lo.name, { reason: 'children', object: lo });
      }
    }
  }

  async finishAddChildren(learningObjects: LearningObject[]) {
    const names = learningObjects.map(l => '\'' + l.name + '\'');

    const confirmation = await this.modalService.makeDialogMenu(
      'confirmChildren',
      'Confirm addition of children',
      `Just to confirm you want to add 
      ${(names.length > 1) ? names.slice(names.length * -1, -1).join(', ') +  ', and ' +  names[names.length - 1] : names[0]}
       to this learning object?`,
       false,
       undefined,
       'center',
       [
         new ModalListElement('Confirm! <i class="far fa-check"></i>', 'confirm', 'good'),
         new ModalListElement('Never mind <i class="far fa-times"></i>', 'cancel', 'bad')
       ]
    ).toPromise();

    if (confirmation === 'confirm') {
      // TODO add multiple children tomorrow
      this.notificationService.notify(
        'Success!',
        'Learning ' + (names.length > 1 ? 'objects' : 'object') + ' successfully added as children!',
        'good',
        'far fa-check'
      );
    }

    this.selected = [];
    this.cancelAddChildren();
  }

  cancelAddChildren() {
    this.freezeSelected = false;
    this.showCancel = this.allowRowClick = this.selectingParent = false;
    this.cancelAction = this.rowClick = () => {};

      this.hidden.forEach(x => {
        if (x.reason === 'children') {
          this.hidden.delete(x.object.name);
        }
      });
  }
}
