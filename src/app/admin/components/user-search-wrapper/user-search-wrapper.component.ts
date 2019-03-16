import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '@cyber4all/clark-entity';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { UserService } from 'app/core/user.service';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-user-search-wrapper',
  templateUrl: './user-search-wrapper.component.html',
  styleUrls: ['./user-search-wrapper.component.scss']
})
export class UserSearchWrapperComponent implements OnInit, OnDestroy {
    // fires every time an input event occurs on the search input element
    userSearchInput$: Subject<string> = new Subject();
    // fires when this component is destroyed
    destroyed$: Subject<void> = new Subject();
    // true if the component is actively querying the services, false otherwise
    loading = false;
    // array of User objects returned from service
    searchResults: User[] = [];
    // search query string, modeled to the search
    query: string;
    // Array of users to add or remove from
    // This array is used when rendering + or x next to user
    @Input() users: User[];
    // Fired when user is selected
    @Output() selectedUserIndex: EventEmitter<number> = new EventEmitter();

  constructor(
    private user: UserService,
    private authService: AuthService,
  ) { }

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
          this.loading = true;
        } else {
          this.clearSearch();
          this.loading = false;
        }
      });
  }

  /**
   * Queries the UserService with query text and sets the searchResults variable
   *
   * @memberof UserSearchWrapperComponent
   */
  findUser(query: string) {
    if (query && query !== '') {
      this.user.searchUsers(query).then((results: User[]) => {
        // remove current user from results
        for (let i = 0; i < results.length; i++) {
          if (this.authService.username === results[i].username) {
            results.splice(i, 1);
          }
        }

        this.searchResults = results;
        console.log(this.searchResults);
        this.loading = false;
      });
    }
  }

  /**
   * Fires event with selected user index
   *
   * @memberof UserSearchWrapperComponent
   */
  selectUser(index: number) {
    this.selectedUserIndex.emit(index);
  }

  /**
   * Clear's the current search text and results
   *
   * @memberof UserSearchWrapperComponent
   */
  clearSearch() {
    this.query = '';
    this.searchResults = [];
    this.loading = false;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
