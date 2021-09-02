import {
  Component,
  OnInit,
  IterableDiffers,
  IterableDiffer,
  EventEmitter,
  Output,
  OnDestroy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { LearningObject, User } from '@entity';
import { UserService } from 'app/core/user.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss']
})
export class UserDropdownComponent implements OnInit, OnDestroy {

  // Search Related Variables
  assignedEvaluators: User[] = []; // Selected users to be assigned (includes already assigned until assigned button is clicked)
  removedEvaluators: User[] = []; // Selected evaluators for removal
  searchResults: User[] = []; // Response of search
  query: string; // Search query string
  loading: boolean; // True when waiting for http response
  userSearchInput$: Subject<string> = new Subject(); // Set after a search input event occurs
  showDropdown: boolean; // True when results should be displayed

  destroyed$: Subject<void> = new Subject(); // Fired when component is destroyed
  differ: IterableDiffer<User>;

  @Input() learningObject: LearningObject; // Learning object that is being assigned assignedEvaluators
  @Output() evaluators: EventEmitter<any> = new EventEmitter(); // Evaluators selected

  constructor(
    private userService: UserService,
    private differs: IterableDiffers,
    private cd: ChangeDetectorRef,
  ) {
    this.differ = this.differs.find([]).create(null);
  }

  async ngOnInit() {
    if (this.learningObject.assigned) {
      for (let i = 0; i < this.learningObject.assigned.length; i++) {
        const userId = this.learningObject.assigned[i];
        const user = await this.userService.getUser(userId, 'userId');
        this.assignedEvaluators.push(user);
      }
      this.cd.detectChanges();
    }

    // subscribe to the search input and fire search after debounce
    this.userSearchInput$
      .pipe(debounceTime(650), takeUntil(this.destroyed$))
      .subscribe((val: string) => {
        this.findUser(val.trim());
      });

    // TODO is there a better way to do this?
    // I want two events to occur when this event fires. 1) after a debounce, perform search
    // 2) immediately (without debounce) show the popup
    this.userSearchInput$
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

  /**
   * Queries the UserService with query text and sets the searchResults variable
   *
   * @memberof UserDropdownComponent
   */
  findUser(query: string) {
    if (query && query !== '') {
      this.userService.searchUsers({
        text: query,
        accessGroups: 'admin,curator,editor,reviewer'
      }).then( (results: User[]) => {
        const assignedEvaluatorsIds = this.assignedEvaluators.map(user => user.id);
        const filteredUsers = [];
        results.forEach( user => {
          if (this.learningObject.assigned && !this.learningObject.assigned.includes(user.id) 
              && !assignedEvaluatorsIds.includes(user.id)) {
            filteredUsers.push(user);
          }
        });
        this.searchResults = filteredUsers;
      });
      this.loading = false;
    }
  }

  /**
   * Clear's the current search text and results
   *
   * @memberof UserDropdownComponent
   */
  clearSearch() {
    this.query = '';
    this.searchResults = [];
    this.loading = false;
    this.showDropdown = false;
  }

  addEvaluator(user?: User) {
    if (user && !this.assignedEvaluators.includes(user)) {
      // Adds user to assigned evaluators array
      this.assignedEvaluators.push(user);

      // Removes user from removed evaluators array
      const index = this.removedEvaluators.indexOf(user);
      if ( index !== -1) {
        this.removedEvaluators.splice(index, 1);
      }

      // Resets the search field
      this.clearSearch();

      // Updates parent component
      this.evaluators.emit({
        "add": this.assignedEvaluators,
        "remove": this.removedEvaluators
      });
    }
  }

  removeEvaluator(user?: User) {
    if (user && !this.removedEvaluators.includes(user)) {
      // Adds removed user to removed evaluators array
      this.removedEvaluators.push(user);

      // Removes user from assigned evaluators array
      const index = this.assignedEvaluators.indexOf(user);
      if ( index !== -1 ) {
        this.assignedEvaluators.splice(index, 1);
      }

      // Updates parent component
      this.evaluators.emit({
        "add": this.assignedEvaluators,
        "remove": this.removedEvaluators
      });
    }
  }

  calcVirtualScrollerHeight() {
    let height = 40;
    if (this.searchResults && this.searchResults.length) {
      height = this.searchResults.length * 40;
    }
    return height < 300 ? `${height}px` : '300px';
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
