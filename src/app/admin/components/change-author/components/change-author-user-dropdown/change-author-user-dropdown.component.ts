import {
  Component,
  OnInit,
  IterableDiffers,
  IterableDiffer,
  EventEmitter,
  Output,
  OnDestroy,
} from '@angular/core';
import { User } from '@entity';
import { UserService } from 'app/core/user.service';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
 
@Component({
  selector: 'clark-change-author-user-dropdown',
  templateUrl: './change-author-user-dropdown.component.html',
  styleUrls: ['./change-author-user-dropdown.component.scss'],
})
export class ChangeAuthorUserDropdownComponent implements OnInit, OnDestroy {
  // array of usernames representing all selected users
  selectedAuthor: User;

  searchResults: User[] = [];

  // search query string, modeled to the search
  query: string;

  differ: IterableDiffer<User>;
  // fires every time an input event occurs on the search input element
  userSearchInput$: Subject<string> = new Subject();
  // fires when this component is destroyed
  destroyed$: Subject<void> = new Subject();
  // true if dropdown results should be shown, false if they should be hidden
  showDropdown: boolean;
  // true if the component is actively querying the services, false otherwise
  loading: boolean;


  // fired when an author is selected
  @Output() newAuthor: EventEmitter<User> = new EventEmitter();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private differs: IterableDiffers
  ) {
    this.differ = this.differs.find([]).create(null);
  }

  ngOnInit() {
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
      this.userService.searchUsers({ text: query }).then((results: User[]) => {
        // remove current user from results
        for (let i = 0; i < results.length; i++) {
          if (this.authService.username === results[i].username) {
            results.splice(i, 1);
          }
        }

        this.searchResults = results;
        this.loading = false;
      });
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

  toggleAuthor(user?: User) {
    if (user) {
      this.selectedAuthor = user;
      this.clearSearch();
      this.newAuthor.emit(user);
    } else {
      this.selectedAuthor = null;
    }
  }


}
