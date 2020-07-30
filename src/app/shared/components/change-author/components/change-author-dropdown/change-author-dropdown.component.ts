import { Component, OnInit, IterableDiffers, DoCheck, OnDestroy, IterableDiffer } from '@angular/core';
import { User } from '@entity';
import { UserService } from 'app/core/user.service';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-change-author-dropdown',
  templateUrl: './change-author-dropdown.component.html',
  styleUrls: ['./change-author-dropdown.component.scss']
})
export class ChangeAuthorDropdownComponent implements OnInit, OnDestroy  {

  query: string;
  userSearchInput$: Subject<string> = new Subject();
  // array of usernames representing all selected users
  selectedAuthor: string;

  // true if dropdown results should be shown, false if they should be hidden
  showDropdown: boolean;
  // true if the component is actively querying the services, false otherwise
  loading: boolean;

  searchResults: User[] = [];

  selectedAuthors: string[] = [];


  differ: IterableDiffer<User>;


  // fires when this component is destroyed
  destroyed$: Subject<void> = new Subject();


  constructor(private userService: UserService, private authService: AuthService, private differs: IterableDiffers) { }

  ngOnInit(): void {
    this.userSearchInput$.pipe(
      debounceTime(650),
      takeUntil(this.destroyed$)
    ).subscribe((val: string) => {
      this.findUser(val.trim());
    });

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


    /**
   * Queries the UserService with query text and sets the searchResults variable
   *
   * @memberof ChangeAuthorDropdownComponent
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

  //   /**
  //  * Toggles an author's selected status
  //  *
  //  * @param {string} id the id of the author to toggle
  //  * @memberof UserDropdownComponent
  //  */
  // toggleAuthor(user: User) {
  //   const authorFoundIndex: number = this.selectedAuthors.indexOf(user.username);

  //   if (authorFoundIndex < 0) {
  //     // we didn't find the author, so push to list
  //     this.selectedAuthors.push(user.username);
  //     this.clearSearch();

  //     this.addAuthor.emit(user);
  //   } else {
  //     // we found the user, pop from list
  //     this.selectedAuthors.splice(authorFoundIndex, 1);

  //     this.removeAuthor.emit(user);
  //   }
  // }

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
