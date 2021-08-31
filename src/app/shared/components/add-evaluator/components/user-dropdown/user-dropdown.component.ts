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
  selectedEvaluators: User[]; // Selected users to be assigned
  searchResults: User[] = []; // Response of search
  query: string; // Search query string
  loading: boolean; // True when waiting for http response
  userSearchInput$: Subject<string> = new Subject(); // Set after a search input event occurs
  showDropdown: boolean; // True when results should be displayed

  destroyed$: Subject<void> = new Subject(); // Fired when component is destroyed
  differ: IterableDiffer<User>;

  @Input() learningObject: LearningObject; // Learning object that is being assigned selectedEvaluators
  @Output() evaluators: EventEmitter<any> = new EventEmitter(); // Evaluators selected

  constructor(
    private userService: UserService,
    private differs: IterableDiffers
  ) {
    this.differ = this.differs.find([]).create(null);
  }

  ngOnInit() {
    console.log(this.learningObject.assigned);
    if (this.learningObject.assigned) {
      this.learningObject.assigned.forEach(userId => {
        this.userService.getUser(userId, 'userId').then( (user: User) => {
          this.selectedEvaluators.push(user);
        });
      });
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

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
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
        accessGroups: 'admin,curator,editor'
      }).then( (results: User[]) => {
        const filteredUsers = [];
        results.forEach( user => {
          if (this.learningObject.assigned && !this.learningObject.assigned.includes(user.id)) {
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
    if (user && !this.selectedEvaluators.includes(user)) {
      this.selectedEvaluators.push(user);
      this.clearSearch();
      this.evaluators.emit(this.selectedEvaluators);
    }
  }

  removeEvaluator(user?: User) {
    if (user) {
      const index = this.selectedEvaluators.indexOf(user);
      if ( index !== -1 ) {
        this.selectedEvaluators.splice(index, 1);
        this.evaluators.emit(this.selectedEvaluators);
      }
    }
  }

  calcVirtualScrollerHeight() {
    let height = 40;
    if (this.searchResults && this.searchResults.length) {
      height = this.searchResults.length * 40;
    }
    return height < 300 ? `${height}px` : '300px';
  }

}
