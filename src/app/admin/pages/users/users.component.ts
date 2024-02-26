import { Component, HostListener, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { UserService } from 'app/core/user-module/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '@entity';
import { AuthService } from 'app/core/auth-module/auth.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { CollectionService, Collection } from 'app/core/collection-module/collections.service';
import { usersComponentAnimations } from './users.component.animations';
import { AccessGroupService } from 'app/core/access-group-module/access-group.service';

@Component({
  selector: 'clark-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: usersComponentAnimations
})
export class UsersComponent implements AfterViewInit {
  searchBarPlaceholder = 'Users';
  users: User[];
  loading = false;
  displayRemoveReviewerModal = false;
  removeReviewerId: string;
  reviewerModal: boolean;
  showPrivileges: boolean;
  selectedUser: User;

  activeCollection: Collection;

  @HostListener('window:keyup', ['$event']) handleKeyUp(event: KeyboardEvent) {
    if (event.code === 'Escape') {
        this.reviewerModal = false;
    }
}

  constructor(
    private user: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToastrOvenService,
    public authService: AuthService,
    private collectionService: CollectionService,
    private access: AccessGroupService
  ) {
  }

  ngAfterViewInit() {
    this.route.parent.params.subscribe(async params => {
      this.activeCollection = await this.collectionService.getCollection(params['collection']);
      if (this.activeCollection) {
        this.fetchReviewers();
      } else {
        this.getUsers();
      }
   });
  }

  /**
   * Retrieve a list of user's with a text query
   *
   * @param {string} [text] the text with which to query
   * @memberof UsersComponent
   */
  getUsers(text?: string) {
    this.loading = true;
    this.user.searchUsers({ text })
      .then(val => {
        this.users = val;
        this.loading = false;
      }).catch(error => {
        this.toaster.error('Error!', 'There was an error fetching users. Please try again later.');
        this.loading = false;
        console.error(error);
      });
  }

  /**
   * Returns the current reviewer members of the specified collection
   */
  async fetchReviewers() {
    this.loading = true;
    this.users = await this.access.fetchReviewers(this.activeCollection.abvName);
    this.loading = false;
  }

  /**
   * Adds a user as a reviewer to a collection after being clicked on in the user search
   *
   * @param user the elements of a clark user such as id and role
   */
  addReviewer(user: User) {
    this.user.assignMember(user.id, this.activeCollection.abvName, 'reviewer').then(() => {
      this.users.splice(0, 0, user);
    }).catch(error => {
      this.toaster.error('Error!', 'Could not add reviewer. Please try again later');
      console.error(error);
    });
  }

  /**
   * Toggle the modal to add reviewers on and off
   *
   * @param {boolean} value true if the modal should display, false otherwise
   * @memberof UsersComponent
   */
  toggleAddReviewerModal(value: boolean) {
    this.reviewerModal = value;
  }

  /**
   * Removes the reviewer access from a user in a collection
   */
  removeReviewer(userId?: string) {
    this.displayRemoveReviewerModal = false;
    this.user.removeMember(this.activeCollection.abvName, userId || this.removeReviewerId ).then(() => {
      this.users = this.users.filter(x => x.id !== userId);
    }).catch(error => {
      this.toaster.error('Error!', 'Could not remove reviewer. Please try again later');
      console.error(error);
    });
  }

  /**
   * Navigate to an author's Learning Objects on the Learning Object's page
   *
   * @param {string} username the username of the author
   * @memberof UsersComponent
   */
  navigateToUserObjects(username: string) {
    this.router.navigate(['admin/learning-objects'], { queryParams: { username } });
  }

  /**
   * Toggle the modal to edit a user's privileges on and select the specified user
   *
   * @param {User} user the user who's privileges should be edited
   * @memberof UsersComponent
   */
  editPrivileges(user: User) {
    this.selectedUser = user;
    this.showPrivileges = true;
  }

  /**
   * Dictates to the *ngFor directive how to track changes to the User's list
   *
   * @param index
   * @param item
   */
  trackby(index: number, item) {
    return item.id;
  }

}
