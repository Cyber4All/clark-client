import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, IterableDiffers, IterableDiffer, DoCheck } from '@angular/core';
import { UserService } from 'app/core/user.service';
import { AuthService } from 'app/core/auth.service';
import { User } from '@entity';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'clark-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  styleUrls: ['./user-dropdown.component.scss'],
})
export class UserDropdownComponent implements OnInit, DoCheck, OnDestroy {
  // array of usernames representing all selected users
  selectedAuthors: string[] = [];
  // array of User objects returned from service
  searchResults: User[] = [];

  // search query string, modeled to the search
  query: string;

  // true if dropdown results should be shown, false if they should be hidden
  showDropdown: boolean;
  // true if the component is actively querying the services, false otherwise
  loading: boolean;

  // fires every time an input event occurs on the search input element
  userSearchInput$: Subject<string> = new Subject();
  // fires when this component is destroyed
  destroyed$: Subject<void> = new Subject();

  @Input() contributors: User[];
  differ: IterableDiffer<User>;

  // fired when an author is added as a contributor
  @Output() addAuthor: EventEmitter<User> = new EventEmitter();
  // fired when an author is removed as a contributor
  @Output() removeAuthor: EventEmitter<User> = new EventEmitter();

  constructor(private userService: UserService, private authService: AuthService, private differs: IterableDiffers) {
    // init contributors iterable differ
    this.differ = this.differs.find([]).create(null);
  }

  ngOnInit() {
    // subscribe to the search input and fire search after debounce
    this.userSearchInput$.pipe(
      debounceTime(650),
      takeUntil(this.destroyed$)
    ).subscribe((val: string) => {
      this.findUser(val.trim());
    });

    // TODO is there a better way to do this?
    // I want two events to occur when this event fires. 1) after a debounce, perform search
    // 2) immediately (without debounce) show the popup
    this.userSearchInput$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((val: string) => {
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

  ngDoCheck() {
    const changes = this.differ.diff(this.contributors);

    if (changes) {
      this.selectedAuthors = [];
      changes.forEachItem(x => {
        this.selectedAuthors.push(x.item.username);
      });
    }
  }

  /**
   * Queries the UserService with query text and sets the searchResults variable
   *
   * @memberof UserDropdownComponent
   */
  findUser(query: string) {
    if (query && query !== '') {
      this.userService.searchUsers({ text: query }).then((results: User[]) => {
        this.searchResults = results;
        this.loading = false;
      });
    }
  }

  /**
   * Toggles an author's selected status
   *
   * @param {string} id the id of the author to toggle
   * @memberof UserDropdownComponent
   */
  toggleAuthor(user: User) {
    const authorFoundIndex: number = this.selectedAuthors.indexOf(user.username);

    if (authorFoundIndex < 0) {
      // we didn't find the author, so push to list
      this.selectedAuthors.push(user.username);
      this.clearSearch();

      this.addAuthor.emit(user);
    } else {
      // we found the user, pop from list
      this.selectedAuthors.splice(authorFoundIndex, 1);

      this.removeAuthor.emit(user);
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

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
