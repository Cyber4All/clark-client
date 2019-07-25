import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { LearningObject } from '@entity';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
@Component({
  selector: 'clark-dashboard-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [
    trigger('listItem', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), {optional: true}),
        query(':enter', [
          stagger('60ms', [
            animate('500ms 200ms ease', style({opacity: 1}))
          ])
        ], {optional: true})
      ])
    ]),
  ]
})
export class ListComponent {
  @Input() showOptions: boolean;
  @Input() learningObjects: LearningObject[];
  @Input() title: string;

  // Event emitters to relay actions to dashboard
  @Output() applyFilters: EventEmitter<any> = new EventEmitter();
  @Output() deleteObjects: EventEmitter<any> = new EventEmitter();
  @Output() cancelCollectionSubmission: EventEmitter<LearningObject> = new EventEmitter();
  @Output() openChangelog: EventEmitter<any> = new EventEmitter();
  @Output() openSidePanel: EventEmitter<LearningObject> = new EventEmitter();
  @Output() submitToCollection: EventEmitter<LearningObject> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();

  // delete logic
  selectedObjects: Map<string, LearningObject> = new Map();

  // Filtering variables
  filters: Map<string, boolean> = new Map();
  filterMenuDown: boolean;

  // delete confirmation
  deleteConfirmation: boolean;

  // Selection variables
  selected: Map<string, LearningObject> = new Map();
  allSelected = false;

  constructor(
    private cd: ChangeDetectorRef
  ) {}

  /**
  * Toggles Filter menu open or closed
  * @param value
  */
  toggleFilterMenu(value) {
    this.filterMenuDown = value;
    console.log(this.learningObjects);
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
    this.applyFilters.emit(this.filters);
  }

  /**
   * Clears all filters from the selected filters list
   */
  clearFilters() {
    this.filters.clear();
    this.applyFilters.emit(this.filters);
  }


  /**
   * Returns a boolean indicating whether or not all Learning Objects are selected
   *
   * @readonly
   * @type {boolean}
   */
  get areAllSelected(): boolean {
    return this.allSelected && this.selected.size === this.learningObjects.length;
  }

  /**
   * Selects all learning objects
   */
  selectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selected = new Map(
        // @ts-ignore
        this.learningObjects.map((x) =>  x)
      );
      this.cd.detectChanges();
    } else {
      this.selected = new Map();
    }
  }

    /**
   * Decides based on the value whether to select or deselect the learning object
   * @param l learning object to be selected
   * @param value boolean, true if object is selected, false otherwise
   */
  toggleSelect(l: LearningObject, value: boolean, index: number) {
    if (value === true) {
      this.selectLearningObject(l, index);
    } else {
      this.deselectLearningObject(l);
    }
  }

    /**
   * Fired on select of a Learning Object, takes the object and either adds to the list of selected Learning Objects
   * @param l Learning Object to be selected
   */
  selectLearningObject(l: LearningObject, index: number) {
    this.selected.set( l.id, l );
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
   * Creates a map of the objects that will be deleted. Takes either a single object or
   * sets the objects to be deleted to the objects selected in the checkboxes
   * @param object
   */
  confirmDelete(object?: any) {
    if (object) {
      this.selectedObjects = new Map();
      this.selectedObjects.set(object.id, object);
    } else {
      this.selectedObjects = this.selected;
    }
    this.deleteConfirmation = true;
  }
}
