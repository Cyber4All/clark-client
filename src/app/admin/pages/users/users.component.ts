import { Component, HostListener, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { UserService } from 'app/core/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import { User } from '@entity';
import { AuthService } from 'app/core/auth.service';
import { ToasterService } from 'app/shared/toaster';

@Component({
  selector: 'clark-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements AfterViewInit {
  searchBarPlaceholder = 'Users';
  users: User[];
  activeCollection: string;
  loading = false;
  displayRemoveReviewerModal = false;
  removeReviewerId: string;
  reviewerModal: boolean;
  showPrivileges: boolean;
  selectedUser: User;

  @HostListener('window:keyup', ['$event']) handleKeyUp(event: KeyboardEvent) {
    if (event.keyCode === 27) {
        this.reviewerModal = false;
    }
}

  constructor(
    private user: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToasterService,
    public authService: AuthService,
  ) {
  }

  ngAfterViewInit() {
    this.route.parent.params.subscribe(params => {
      this.activeCollection = params['collection'];
      if (this.activeCollection) {
        this.fetchReviewers();
      } else {
        this.getUsers();
      }
   });
  }

  getUsers(text?: string) {
    this.loading = true;
    this.user.searchUsers({ text })
      .then(val => {
        this.users = val;
        this.loading = false;
      }).catch(error => {
        this.toaster.notify('Error!', 'There was an error fetching users. Please try again later.', 'bad', 'far fa-times');
        this.loading = false;
        console.error(error);
      });
  }

  /**
   * Returns the current reviewer members of the specified collection
   */
  async fetchReviewers() {
    this.loading = true;
    this.users = await this.user.fetchReviewers(this.activeCollection, {role: 'reviewer'});
    this.loading = false;
  }

  /**
   * Adds a user as a reviewer to a collection after being clicked on in the user search
   * @param user the elements of a clark user such as id and role
   */
  addReviewer(user: User) {
    this.user.assignMember(user.id, this.activeCollection, 'reviewer').then(() => {
      this.users.splice(0, 0, user);
    }).catch(error => {
      this.toaster.notify('Error!', 'Could not add reviewer. Please try again later', 'bad', 'far fa-times');
      console.error(error);
    });
  }

  toggleAddReviewerModal(value: boolean) {
    this.reviewerModal = value;
  }

  /**
   * Removes the reviewer access from a user in a collection
   */
  removeReviewer(userId?: string) {
    this.displayRemoveReviewerModal = false;
    this.user.removeMember(this.activeCollection, userId || this.removeReviewerId ).then(() => {
      this.users = this.users.filter(x => x.id !== userId);
    }).catch(error => {
      this.toaster.notify('Error!', 'Could not remove reviewer. Please try again later', 'bad', 'far fa-times');
      console.error(error);
    });
  }

  navigateToUserObjects(username: string) {
    this.router.navigate(['admin/learning-objects'], { queryParams: { username } });
  }

  editPrivileges(user: User) {
    this.selectedUser = user;
    this.showPrivileges = true;
  }

  trackby(index: number, item) {
    return item.id;
  }

}
