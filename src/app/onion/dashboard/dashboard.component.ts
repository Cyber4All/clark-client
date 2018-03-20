import { ModalService, ModalListElement, Position } from '../../shared/modals';
import { NotificationService } from '../../shared/notifications';
import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { LearningObjectService } from '../core/learning-object.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { ChangeDetectorRef } from '@angular/core';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
@Component({
  selector: 'onion-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public tips = TOOLTIP_TEXT;
  learningObjects: Array<LearningObject>;
  focusedLearningObject: LearningObject; // learning object that has a popup up menu on display for it, used by delete and edit functions
  selected: Array<string> = []; // array of all learning objects that are currently selected (checkbox in UI)
  hidden: Array<string> = []; // array of Learning Object id's that have been hidden from the view
  filters: Array<string> = []; // list of filters to be applied to the list of Learning Objects
  allSelected = false;

  constructor(
    private learningObjectService: LearningObjectService,
    private router: Router,
    private modalService: ModalService,
    private notificationService: NotificationService,
    private app: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.learningObjects = this.route.snapshot.data['learningObjects'];
  }
  /**
   * Fetches and sets LearningObject[]
   *
   * @memberof DashboardComponent
   */
  getLearningObjects() {
    this.learningObjectService
      .getLearningObjects()
      .then(learningObjects => {
        this.learningObjects = learningObjects;
      })
      .catch(err => {
        console.log('error', err);
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
              .then(() => {
                this.notificationService.notify(
                  'Done!',
                  'New Learning Object(s) deleted!',
                  'good',
                  'far fa-times'
                );
                this.getLearningObjects();
              })
              .catch(err => {
                this.getLearningObjects();
              });
          } else {
            this.learningObjectService
              // TODO: Verify selected is an array of names
              .deleteMultiple(this.selected)
              .then(() => {
                this.selected = [];
                this.notificationService.notify(
                  'Done!',
                  'New Learning Object(s) deleted!',
                  'good',
                  'far fa-times'
                );
                this.getLearningObjects();
              })
              .catch(err => {
                console.log(err);
              });
          }
        }
      });
  }

  async togglePublished() {
    try {
      await this.learningObjectService.togglePublished(
        this.focusedLearningObject
      );
      this.getLearningObjects();
    } catch (e) {
      console.log(`Error on togglePublished. Error: ${e}`);
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
    if (!this.selected.includes(l['name'])) {
      this.selected.push(l['name']);
    }
    this.app.detectChanges();
  }

  /**
   * Fired on select of a Learning Object, takes the object and removes it from the list of selected Learning Objects
   * @param l Learning Object to be deselected
   */
  deselectLearningObject(l: LearningObject) {
    this.selected.splice(this.selected.indexOf(l['name']), 1);
    this.app.detectChanges();
  }

  /**
   * Selects all learning objects (duh)
   */
  selectAll(selected) {
    this.allSelected = !this.allSelected;
  }

  /**
   * Takes a string input representing a filter, checks for a minus sin in the 0 position. If not found, adds the filter to the array
   * if it's not already present. If a minus is found, checks for and removes the named filter from the filters array
   *
   * @param val
   */
  manageFilters(val) {
    if (val.charAt(0) === '-') {
      // we're removing
      this.filters.splice(this.filters.indexOf(val.substring(1)), 1);
    } else {
      // we're adding
      if (!this.filters.includes(val)) {
        this.filters.push(val);
      }
    }
  }

  /**
   * Takes a Learning Object and compares it against the list of applied filters, adds the 'hide' class when the LO is filtered out
   *
   * @param l Learning Object to be tested
   */
  // TODO: Is this still being used?
  checkFilter(l: LearningObject): boolean {
    if (this.filters.includes('courses')) {
      if (l['length'] !== 'course') {
        return false;
      }
    }
    return true;
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
    let list: Array<ModalListElement> = [
      new ModalListElement('<i class="far fa-edit"></i>Edit', 'edit'),
      new ModalListElement(
        '<i class="far fa-upload"></i>Manage Materials',
        'upload'
      ),
      new ModalListElement(
        '<i class="far fa-archive"></i>View Materials',
        'view materials'
      )
    ];

    if (!learningObject.published) {
      list.push(
        new ModalListElement(
          '<i class="far fa-eye"></i>Publish',
          'toggle published'
        )
      );
    } else {
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
          case 'view materials':
            this.router.navigate([
              '/onion/content/view/' + this.focusedLearningObject.name
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

  /**
   * Creates a dropdown menu that displays a list of possible filters for the dashboard content
   *
   * @param event click event
   */
  filterDropdown(event) {
    const list: Array<ModalListElement> = [
      new ModalListElement(
        '<i class="far fa-check-circle"></i>Published',
        'published',
        'no-hover',
        true
      ),
      new ModalListElement(
        '<i class="far fa-ban"></i>Unpublished',
        'unpublished',
        'no-hover',
        true
      )
    ];
    const pos = new Position(
      this.modalService.offset(event.currentTarget).left -
        (190 - event.currentTarget.offsetWidth),
      this.modalService.offset(event.currentTarget).top +
        event.currentTarget.offsetHeight +
        15
    );
    this.modalService
      .makeContextMenu(
        'FilteringContext',
        'dropdown',
        list,
        null,
        pos,
        this.filters.slice(0)
      )
      .subscribe(val => {
        if (val !== 'null') {
          this.manageFilters(val);
        }
      });
  }
}
