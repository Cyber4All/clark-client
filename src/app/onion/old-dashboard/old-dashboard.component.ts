
import {debounceTime, takeUntil} from 'rxjs/operators';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { LearningObject } from '@entity';
import { LearningObjectService } from 'app/onion/core/learning-object.service';
import { lengths as LengthsSet } from '@cyber4all/clark-taxonomy';
import { AuthService } from 'app/core/auth.service';
import { ToasterService } from '../../shared/Shared Modules/toaster/toaster.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { trigger, transition, style, animate, animateChild, query, stagger } from '@angular/animations';
import { NavbarService } from 'app/core/navbar.service';
import { CollectionService } from '../../core/collection.service';
import { ActivatedRoute } from '@angular/router';
import { ChangelogService } from 'app/core/changelog.service';

export interface DashboardLearningObject extends LearningObject {
  status: LearningObject.Status;
  parents: string[];
}

@Component({
  selector: 'clark-dashboard',
  templateUrl: './old-dashboard.component.html',
  styleUrls: ['./old-dashboard.component.scss'],
  animations: [
    trigger('list', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('500ms 600ms ease-out', style({opacity: 1, transform: 'translateY(-0px)'})),
        query( '@listItem', animateChild(), {optional: true} )
      ]),
    ]),
    trigger('listItem', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), {optional: true}),
        query(':enter', [
          stagger('60ms', [
            animate('600ms 200ms ease', style({opacity: 1}))
          ])
        ], {optional: true})
      ])
    ]),
    trigger('greeting', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('200ms 100ms ease-out', style({ transform: 'translateY(0px)', opacity: 1 }))
      ]),
    ]),
    trigger('splash', [
      transition(':enter', [
        style({width: '0px', 'padding-left': '0px', 'padding-right': '0px', opacity: 0}),
        animate('300ms ease-out', style({width: '100%', 'padding-left': '20px', 'padding-right': '20px', 'opacity': 1})),
        query( '@greeting', animateChild() )
      ])
    ]),
    // loading template and empty banner
    trigger('nonListItem', [
      transition(':enter', [
        style({transform: 'translateY(-20px)', opacity: 0}),
        animate('200ms 100ms', style({opacity: 1, transform: 'translateY(0px)'}))
      ]),
      transition(':leave', [
        style({'transform': 'translateY(0px)', opacity: 1}),
        animate('130ms ease', style({'transform': 'translateY(20px)', opacity: 0}))
      ]),
    ])
  ]
})
export class OldDashboardComponent implements OnInit, OnDestroy {
  learningObjects: DashboardLearningObject[];

  @ViewChild('listInner') listInnerElement: ElementRef;

  greetingTime: string; // morning, afternoon, or evening depending on user's clock
  childrenConfirmationMessage: string; // string generated for children confirmation modal
  focusedLearningObject: DashboardLearningObject;

  openChangelogModal: boolean;
  changelogLearningObject: LearningObject;
  changelogs: [];
  loadingChangelogs: boolean;

  sidePanelController$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // Observables
  destroyed$: Subject<void> = new Subject();
  filtersModified$: Subject<void> = new Subject();

  // popup generator handlers
  deleteConfirmation: Iterator<any>;
  childrenConfirmation: Iterator<any>;

  // flags
  loading = false;
  allSelected = false;
  editingChildren = false;
  filterMenuDown = false;
  submitToCollection = false;

  // collections
  // selected simply means the checkbox next to the object is checked
  selected: Map<string, { index: number; object: DashboardLearningObject }> = new Map();
  // hidden means that the object is downloaded byt not visible
  hidden: Map<string, Map<string, DashboardLearningObject>> = new Map();
  // disabled means that the object is visible but can't be mutated, EG no meatball menu and no checkbox
  disabled: Map<string, Map<string, DashboardLearningObject>> = new Map();
  // filters applied to dashboard objects (status filters)
  filters: Map<string, boolean> = new Map();

  constructor(
    private learningObjectService: LearningObjectService,
    private changelogService: ChangelogService,
    private collectionService: CollectionService,
    private cd: ChangeDetectorRef,
    private notificationService: ToasterService,
    private nav: NavbarService,
    public auth: AuthService, // used in markup,
    public route: ActivatedRoute
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
    this.nav.show();
    // retrieve list of users learning objects
    this.loading = true;
    setTimeout(async() => {
      this.learningObjects = await this.getLearningObjects();
    }, 1100);

    // monitor filters for change and refresh query
    this.filtersModified$.pipe(takeUntil(this.destroyed$), debounceTime(400), ).subscribe(async () => {
      const filters = {status: Array.from(this.filters.keys())};
      this.learningObjects = await this.getLearningObjects(filters);
    });

    // if the user is trying to edit a released learning object, then get the status and alert the user
    this.route.queryParams.pipe(takeUntil(this.destroyed$), debounceTime(400)).subscribe(queryParams => {
      if (queryParams.status && queryParams.status === '403') {
        this.notificationService.notify(
          'Error!', 'This learning object is currently released and cannot be edited!', 'bad', 'far fa-times'
        );
      }
    });
  }

  /**
   * Returns a boolean indicating whether or not all Learning Objects are selected
   *
   * @readonly
   * @type {boolean}
   * @memberof OldDashboardComponent
   */
  get areAllSelected(): boolean {
    return this.allSelected && this.selected.size === this.learningObjects.length;
  }

  getInnerHeight(): number {
    return (document.getElementsByClassName('.list-inner')[0] as HTMLElement).offsetHeight;
  }

  /**
   * Hide or show the filter dropdown menu
   * @param {boolean} [value] true if open, false otherwise
   */
  toggleFilterMenu(value?: boolean) {
    this.filterMenuDown = value;
  }

  /**
   * Add or remove filter from filters list
   * @param filter {string} the filter to be toggled
   */
  toggleFilter(filter: string) {
    if (this.filters.get(filter)) {
      this.filters.delete(filter);
    } else {
      this.filters.set(filter, true);
    }

    this.filtersModified$.next();
  }

  /**
   * Remove all applied filters
   */
  clearFilters() {
    this.filters = new Map();
    this.filtersModified$.next();
  }

  /**
   * Fetches logged-in user's learning objects from API and builds the hierarchy structure
   *@returns DashboardLearningObject[]
   * @memberof DashboardComponent
   */
  async getLearningObjects(filters?: any): Promise<DashboardLearningObject[]> {
    this.loading = true;
    return this.learningObjectService
      .getLearningObjects(this.auth.username, filters)
      .then((learningObjects: LearningObject[]) => {
        this.loading = false;
        // deep copy list of learningObjects and initialize empty parents array
        const arr: DashboardLearningObject[] = Array.from(
          learningObjects.map(l => {
            const newLo = l as DashboardLearningObject;
            newLo.parents = [];

            if (!newLo.status) {
              newLo.status = LearningObject.Status.UNRELEASED;
            }
            return newLo as DashboardLearningObject;
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
   * Selects all learning objects
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
  selectLearningObject(l: DashboardLearningObject, index: number) {
    this.selected.set(l.id, { index, object: l });
    this.cd.detectChanges();

    if (
      this.selected.size === this.learningObjects.length &&
      !this.allSelected
    ) {
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
  async *delete(objects: DashboardLearningObject[] | DashboardLearningObject) {
    const confirm = yield;
    if (!confirm) {
      return;
    }

    if (!Array.isArray(objects) || objects.length === 1) {
      const object = Array.isArray(objects) ? objects[0] : objects;
      this.learningObjectService
        .delete(object.name , object.author.username)
        .then(async () => {
          this.notificationService.notify(
            'Done!',
            'Learning Object deleted!',
            'good',
            'far fa-check'
          );
          this.learningObjects = await this.getLearningObjects();
          this.clearSelected();
        })
        .catch(err => {
          console.log(err);
          this.notificationService.notify(
            'Error!',
            'Learning Object could not be deleted!',
            'bad',
            'far fa-times'
          );
        });
    } else {
      // multiple deletion
      const canDelete = objects.filter(s => [LearningObject.Status.UNRELEASED, LearningObject.Status.REJECTED].includes(s.status));

      if (canDelete.length) {
        const authorUsername = canDelete[0].author.username;
        this.learningObjectService
          // TODO: Verify selected is an array of names
          .deleteMultiple(canDelete.map(s => s.name), authorUsername)
          .then(async () => {
            this.clearSelected();
            if (canDelete.length === objects.length) {
              this.notificationService.notify(
                'Done!',
                'Learning Objects deleted!',
                'good',
                'far fa-check'
              );
            } else {
              this.notificationService.notify(
                'Warning!',
                'Some learning objects couldn\'t be deleted! You can only delete learning objects that haven\'t been published.',
                'warning',
                'fas fa-exclamation'
              );
            }
            this.learningObjects = await this.getLearningObjects();
          })
          .catch(err => {
            console.log(err);
            this.notificationService.notify(
              'Error!',
              'Learning Objects could not be deleted!',
              'bad',
              'far fa-times'
            );
          });
      } else {
        this.notificationService.notify(
          'Warning!',
          'Learning objects couldn\'t be deleted! You can only delete learning objects that haven\'t been published.',
          'warning',
          'fas fa-exclamation'
        );
      }
    }

    this.deleteConfirmation = undefined;

    return;
  }

  /**
   * Modify UI for addition of children
   * @param object {DashboardLearningObject} object to which children should be addeds
   */
  editChildren(object: DashboardLearningObject) {
    this.editingChildren = true;
    this.focusedLearningObject = object;
    // forcible deselect any selected objects to repurpose the checkboxes for editing children
    this.clearSelected();

    const lengths = Array.from(LengthsSet.values());
    const objectLengthIndex = lengths.indexOf(object.length);

    // disabled the object we're adding to
    this.disableLearningObject(object, 'children');

    // loop through all objects, hide if they're ineligible, select if they're already children
    for (let i = 0, l = this.learningObjects.length; i < l; i++) {
      const tempObject = this.learningObjects[i];

      if (
        object.id !== tempObject.id &&
        lengths.indexOf(tempObject.length) >= objectLengthIndex
      ) {
        // this object is ineligible to be a child, hide it
        this.hideLearningObject(tempObject, 'children');
      } else if (tempObject.parents.includes(object.name)) {
        // this object is already a child, select it
        this.selectLearningObject(tempObject, i);
      }
    }
  }

  /**
   * Cancel the editChildren process by flipping the editingChildrenFlag, clearing the selected list,
   * and removing any children-related disabled/hidden entries
   */
  cancelEditChildren() {
    this.editingChildren = false;
    this.clearSelected();

    this.invalidateHiddenReason('children');
    this.invalidateDisabledReason('children');
  }

  /**
   * Finish adding children by checking for changes and canceling if there are none, or confirming the children changes and then
   * sending changes to service.
   *
   * This is a generator function.
   * The confirmation modal is shown from the markup by setting the childrenConfirmation variable
   * to the return value of this function and then immediately calling the .next() function,
   * IE childrenConfirmation = delete(l); childrenConfirmation.next();
   * To confirm or deny the confirmation, call childrenConfirmation.next(true) or childrenConfirmation.next(false)
   * @param objects {DashboardLearningObject[]} list of objects to be deleted
   */
  async *finishAddChildren() {
    const names = Array.from(this.selected.values()).map(l => l.object.name);

    // create a deep copy of the array resulting from iterating the list of current children and mapping their names
    const current: string[] = Array.from(
      (this.focusedLearningObject.children as LearningObject[]).map(l => l.name)
    );

    // check if no changes
    if (JSON.stringify(current) === JSON.stringify(names)) {
      // no changes
      this.cancelEditChildren();
      return;
    } else {
      // build a confirmation string
      const [additions, removals] = this.parseChildrenChanges(names, current);

      if (additions.length || removals.length !== current.length) {
        const [addMessage, removeMessage] = this.buildAddRemoveMessages(
          additions,
          removals
        );

        this.childrenConfirmationMessage = `Just to confirm, you want to ${addMessage} ${removeMessage} '${
          this.focusedLearningObject.name
        }'?`;
      } else {
        this.childrenConfirmationMessage = `Just to confirm, you want to remove all children from '${
          this.focusedLearningObject.name
        }'?`;
      }

      // wait for respone from popup
      const confirmation = yield;

      if (confirmation) {
        const ids = this.learningObjects
          .filter(l => names.includes(l.name))
          .map(l => l.id);
        this.learningObjectService
          .setChildren(this.focusedLearningObject.name, this.focusedLearningObject.author.username, ids)
          .then(val => {
            this.notificationService.notify(
              'Success!',
              'Learning Object\'s children updated successfully!',
              'good',
              'far fa-check'
            );

            this.cancelEditChildren();

            this.getLearningObjects().then(objects => {
              this.learningObjects = objects;
            });
          })
          .catch(error => {
            console.log(error);

            this.notificationService.notify(
              'Error!',
              'An error occurred and the Learning Object\'s children could not be updated',
              'bad',
              'far fa-times'
            );
          });
      }
    }
  }

  /**
   * Takes a list of changes (the currently selected map of LO names) and a list of the already existing LO names in the
   * focusedObject's children and returns an array of names that were added and another array of names that were removed
   * @param changes {string[]} list of learning object names currently selected
   * @param exisiting {string[]} list of learning object names already present in a learning object's children array
   * @return {[string, string]} Array where first value is a list of additions and second value is a list of removals
   */
  parseChildrenChanges(
    changes: string[],
    exisiting: string[]
  ): [string[], string[]] {
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
  buildAddRemoveMessages(
    additions: string[],
    removals: string[]
  ): [string, string] {
    const addMessage = additions.length
      ? `add ${
          additions.length > 1
            ? additions
                .slice(0, additions.length - 1)
                .map(n => '\'' + n + '\'')
                .join(', ') +
              ' and \'' +
              additions[additions.length - 1] +
              '\''
            : '\'' + additions[additions.length - 1] + '\''
        } ${removals.length ? '' : 'to'} `
      : '';

    const removeMessage = removals.length
      ? `and remove ${
          removals.length > 1
            ? removals
                .slice(0, removals.length - 1)
                .map(n => '\'' + n + '\'')
                .join(', ') +
              ' and \'' +
              removals[removals.length - 1] +
              '\''
            : '\'' + removals[removals.length - 1] + '\''
        } from `
      : '';

    return [addMessage, removeMessage];
  }

  /**
   * Takes a learning object and returns a list of it's children's names or an empty list
   * @return {string[]}
   */
  objectChildrenNames(learningObject: LearningObject): string[] {
    if (learningObject.children && learningObject.children.length) {
      return (learningObject.children as LearningObject[]).map(l => l.name);
    } else {
      return [];
    }
  }

  /**
   * Hide a learning object for a specific reason by adding it to the hidden Map
   * @param l {DashboardLearningObject} the object to hide
   * @param reason {string} a unique one-word description of why that object is hidden (used as key)
   */
  hideLearningObject(l: DashboardLearningObject, reason: string) {
    const currentHiddenObject = this.hidden.get(l.id);

    if (!currentHiddenObject) {
      // this object isn't already hidden, just add a new map
      this.hidden.set(l.id, new Map([[reason, l]]));
    } else if (!currentHiddenObject.get(reason)) {
      // this object is already hidden, grab the map object and add this reason to it
      currentHiddenObject.set(reason, l);
      this.hidden.set(l.id, currentHiddenObject);
    }
  }

  /**
   * Disables a learning object for a specific reason by adding it to the disabled Map
   * @param l {DashboardLearningObject} the object to be disabled
   * @param reason {string} a unique one-word description of why that object is hidden (used as key)
   */
  disableLearningObject(l: DashboardLearningObject, reason: string) {
    const currentDisabledObject = this.hidden.get(l.id);

    if (!currentDisabledObject) {
      // this object isn't already hidden, just add a new map
      this.disabled.set(l.id, new Map([[reason, l]]));
    } else if (!currentDisabledObject.get(reason)) {
      // this object is already hidden, grab the map object and add this reason to it
      currentDisabledObject.set(reason, l);
      this.disabled.set(l.id, currentDisabledObject);
    }
  }

  /**
   * Iterate the hidden Map and remove any entries with specified reason
   * @param reason {string} the reason to be invalidated
   */
  invalidateHiddenReason(reason: string) {
    const markedToDelete: string[] = [];

    this.hidden.forEach((el, key) => {
      el.delete(reason);

      // we've removed all reasons, this object shouldn't be disabled anymore
      if (el.size === 0) {
        markedToDelete.push(key);
      }
    });

    if (markedToDelete.length) {
      for (const id of markedToDelete) {
        this.hidden.delete(id);
      }
    }
  }

  /**
   * Iterate the disabled Map and remove any entries with specified reason
   * @param reason {string} the reason to be invalidated
   */
  invalidateDisabledReason(reason: string) {
    const markedToDelete: string[] = [];

    this.disabled.forEach((el, key) => {
      el.delete(reason);
      // we've removed all reasons, this object shouldn't be disabled anymore
      if (el.size === 0) {
        markedToDelete.push(key);
      }
    });

    if (markedToDelete.length) {
      for (const id of markedToDelete) {
        this.disabled.delete(id);
      }
    }
  }

  /**
   * Publishes a learning object and adds it to a specified collection
   * @param collection {string} the name of the collection to add this learning object to
   */
  async addToCollection(collection?: string) {
    if (collection) {
      this.collectionService.submit({
        userId: this.focusedLearningObject.author.id,
        learningObjectId: this.focusedLearningObject.id,
        collectionName: collection,
      }).then(() => {
        this.focusedLearningObject.status = LearningObject.Status.WAITING;
        this.focusedLearningObject.collection = collection;
        this.cd.detectChanges();
      }).catch (err => {
        // error
        console.error(err);
        this.notificationService.notify(
          'Error!',
          `Error submitting learning object to ${collection} collection!`,
          'bad',
          'far fa-times'
        );
      });
    } else {
      console.error('No collection defined!');
    }

    this.submitToCollection = false;
  }

  /**
   * Cancel a submission while in waiting status
   * @param l {DashboardLearningObject} learning object to be unpublished
   */
  cancelSubmission(l: DashboardLearningObject) {
    this.collectionService.unsubmit({
      learningObjectId: l.id,
      userId: l.author.id,
    }).then(async () => {
      l.status = LearningObject.Status.UNRELEASED;
      this.cd.detectChanges();
    }).catch(err => {
      console.error(err);
    });
  }

  /**
   * Opens the Change Log modal for a specified Learning Object and fetches the appropriate change logs
   *
   * @param {string} learningObjectId the id of the Learning Object for which to fetch change logs
   * @memberof DashboardComponent
   */
  async openViewAllChangelogsModal(learningObjectId: string) {
    this.openChangelogModal = true;
    this.loadingChangelogs = true;
    this.changelogLearningObject = this.learningObjects.find(learningObject => learningObject.id === learningObjectId);
    try {
      this.changelogs =  await this.changelogService.fetchAllChangelogs({
        userId: this.changelogLearningObject.author.id,
        learningObjectId: this.changelogLearningObject.id,
      });
    } catch (error) {
      let errorMessage;

      if (error.status === 401) {
        // user isn't logged-in, set client's state to logged-out and reload so that the route guards can redirect to login page
        this.auth.logout();
      } else {
        errorMessage = 'We encountered an error while attempting to retrieve change logs for this Learning Object. Please try again later.';
      }

      this.notificationService.notify('Error!', errorMessage, 'bad', 'far fa-times');
    }

    this.loadingChangelogs = false;
  }

  /**
   * Closes any open change log modals
   *
   * @memberof DashboardComponent
   */
  closeChangelogsModal() {
    this.openChangelogModal = false;
    this.changelogs = undefined;
  }

   /**
   * Open the Learning Object's information in a side panel
   *
   * @memberof DashboardComponent
   */
  openLearningObjectSidePanel(event: DashboardLearningObject) {
    this.focusedLearningObject = event;
    this.cd.detectChanges();
    this.sidePanelController$.next(true);
  }

  /**
   * Return a list of the selected learning object's
   * @return {DashboardLearningObjects[]} List of selected learning object's
   */
  getSelectedObjects(): DashboardLearningObject[] {
    return Array.from(this.selected.values()).map(x => x.object);
  }

  ngOnDestroy() {
    // subscription clean up
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
