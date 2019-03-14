import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, IterableDiffers, IterableDiffer, DoCheck  } from '@angular/core';
import { User, Collection } from '@cyber4all/clark-entity';
import { UserService } from 'app/core/user.service';
import {Router} from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'clark-users',
  templateUrl: './reviewers.component.html',
  styleUrls: ['./reviewers.component.scss']
})
export class ReviewersComponent implements OnInit {
  searchBarPlaceholder = 'Reviewers';
  reviewers: User[];
  activeCollection: Collection;
  displaySearchModal = false;
  modalOpenSuccess = false;
  modalOpenFailure = false;

  // array of usernames representing all selected users
  selectedReviewers: string[] = [];
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
  @Output() addReviewer: EventEmitter<User> = new EventEmitter();
  // fired when an author is removed as a contributor
  @Output() removeReviewer: EventEmitter<User> = new EventEmitter();

  constructor(private user: UserService, private router: Router, private authService: AuthService, private differs: IterableDiffers) {
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

  DoCheck() {
    const changes = this.differ.diff(this.contributors);

    if (changes) {
      this.selectedReviewers = [];
      changes.forEachItem(x => {
        this.selectedReviewers.push(x.item.username);
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
      this.user.searchUsers(query).then((results: User[]) => {
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
   * Toggles an author's selected status
   *
   * @param {string} id the id of the author to toggle
   * @memberof UserDropdownComponent
   */
  toggleAuthor(reviewer: User) {
    const authorFoundIndex: number = this.selectedReviewers.indexOf(reviewer.username);

    if (authorFoundIndex < 0) {
      // we didn't find the author, so push to list
      this.selectedReviewers.push(reviewer.username);
      this.clearSearch();

      this.addReviewer.emit(reviewer);
    } else {
      // we found the user, pop from list
      this.selectedReviewers.splice(authorFoundIndex, 1);

      this.removeReviewer.emit(reviewer);
    }
  }

  getReviewers(text: string) {
    this.loading = true;
    this.user.searchUsers(text)
      .then(val => {
        this.reviewers = val;
        this.loading = false;
      });
  }

  openSearchModal() {
    this.displaySearchModal = true;
  }

  closeSearchModal() {
    this.displaySearchModal = false;
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

  navigateToUserObjects(username: string) {
    this.router.navigate(['admin/learning-objects'], { queryParams: { username } });
  }

  OnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}
