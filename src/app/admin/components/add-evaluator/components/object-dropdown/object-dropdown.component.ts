import {
  Component,
  OnInit,
  IterableDiffers,
  IterableDiffer,
  EventEmitter,
  Output,
  OnDestroy,
  Input,
} from '@angular/core';
import { LearningObject, User } from '@entity';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'clark-object-dropdown',
  templateUrl: './object-dropdown.component.html',
  styleUrls: ['./object-dropdown.component.scss']
})
export class ObjectDropdownComponent implements OnInit, OnDestroy {

  // Search Related Variables
  assignedObjects: LearningObject[] = []; // Objects to be assigned to the evaluator
  removedObjects: LearningObject[] = []; // Objects to be unassigned from the evaluator
  searchResults: LearningObject[] = []; // Response of search
  query: string; // Search query string
  loading: boolean; // True when waiting for http response
  objectSearchInput$: Subject<string> = new Subject(); // Set after a search input event occurs
  showDropdown: boolean; // True when results should be displayed

  destroyed$: Subject<void> = new Subject(); // Fired when component is destroyed
  differ: IterableDiffer<User>;

  @Input() user: User; // user that is being assigned selectedObjects
  @Output() learningObjects: EventEmitter<any> = new EventEmitter(); // Objects selected

  constructor(
    private learningObjectService: LearningObjectService,
    private differs: IterableDiffers
  ) {
    this.differ = this.differs.find([]).create(null);
  }

  ngOnInit() {
    // subscribe to the search input and fire search after debounce
    this.objectSearchInput$
      .pipe(debounceTime(650), takeUntil(this.destroyed$))
      .subscribe((val: string) => {
        this.findObjects(val.trim());
      });

    this.objectSearchInput$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((val: string) => {
        if (val && val !== '') {
          this.showDropdown = true;
          this.loading = true;
        } else {
          this.clearSearch();
          this.showDropdown = false;
          this.loading = false;
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  /**
   * Queries the LearningObjectService with query text and sets the searchResults variable
   *
   * @memberof ObjectDropdownComponent
   */
  async findObjects(query: string) {
    if (query && query !== '') {
      // Search for learning objects
      await this.learningObjectService
        .getLearningObjects({text: query})
        .then( (results: {learningObjects: LearningObject[], total: number}) => {
          const assignedIds = this.assignedObjects.map(obj => obj.id);
          const filteredObjects: LearningObject[] = [];

          // Filters out already selected objects
          results.learningObjects.forEach( (obj: LearningObject) => {
            if (!assignedIds.includes(obj.id) && (Array.isArray(obj.assigned) && !obj.assigned.includes(this.user.userId))) {
              filteredObjects.push(obj);
            }
          });
          this.searchResults = filteredObjects;
        });
      this.loading = false;
    }
  }

  /**
   * Clear's the current search text and results
   *
   * @memberof ObjectDropdownComponent
   */
  clearSearch() {
    this.query = '';
    this.searchResults = [];
    this.loading = false;
    this.showDropdown = false;
  }

  addSelectedObject(object?: LearningObject) {
    if (object && !this.assignedObjects.includes(object)) {
      // Adds object to assignment array
      this.assignedObjects.push(object);

      // Remove object from removed array if exists
      const index = this.removedObjects.indexOf(object);
      if (index !== -1) {
        this.removedObjects.splice(index, 1);
      }
      this.clearSearch();

      // Emits to parent
      this.learningObjects.emit({
        'add': this.assignedObjects,
        'remove': this.removedObjects
      });
    }
  }

  removeSelectedObject(object?: LearningObject) {
    if (object && !this.removedObjects.includes(object)) {
      // Adds new removed object
      this.removedObjects.push(object);

      // Removes object from assignment array
      const index = this.assignedObjects.indexOf(object);
      if ( index !== -1 ) {
        this.assignedObjects.splice(index, 1);
      }

      // Emit change to parent
      this.learningObjects.emit({
        'add': this.assignedObjects,
        'remove': this.removedObjects
      });
    }
  }

  // Virtual scroller height
  calcVirtualScrollerHeight() {
    let height = 40;
    if (this.searchResults && this.searchResults.length) {
      height = this.searchResults.length * 40;
    }
    return height < 300 ? `${height}px` : '300px';
  }

}
