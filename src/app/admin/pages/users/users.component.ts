import { Component, OnInit, HostListener } from '@angular/core';
import { UserService } from 'app/core/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import { User } from '@entity';
import { AuthService } from 'app/core/auth.service';
import { trigger, transition, style, animate, animateChild, query } from '@angular/animations';

@Component({
  selector: 'clark-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  animations: [
    trigger('fade', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate('100ms', style({ opacity: 1 })),
            query( '@scale', animateChild() )
        ]),
        transition(':leave', [
            style({ opacity: 1 }),
            animate('100ms', style({ opacity: 0 })),
            query( '@scale', animateChild() )
        ])
    ]),
    trigger('scale', [
        transition(':enter', [
            style({ transform: 'scale(0.8)', opacity: 0 }),
            animate('100ms 70ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
        ]),
        transition(':leave', [
            style({ transform: 'scale(1)', opacity: 1 }),
            animate('100ms ease-out', style({ transform: 'scale(0.8)', opacity: 0 }))
        ])
    ])
],
})
export class UsersComponent implements OnInit {
  searchBarPlaceholder = 'Users';
  users: User[];
  activeCollection: string;
  loading = false;
  displayRemoveReviewerModal = false;
  removeReviewerId: string;
  isSearching: boolean;
  showPrivileges: boolean;
  selectedUser: User;

  @HostListener('window:keyup', ['$event']) handleKeyUp(event: KeyboardEvent) {
    if (event.keyCode === 27) {
        this.isSearching = false;
    }
}

  constructor(
    private user: UserService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
  ) {
  }

  ngOnInit() {
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
    this.user.searchUsers(text)
      .then(val => {
        this.users = val;
        this.loading = false;
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
  async addReviewer(user: User) {
    await this.user.assignMember(user.id, this.activeCollection, {role: 'reviewer'});
    await this.fetchReviewers();
  }

/**
 * Opens up a modal of a selected reviewer in a collection which gives the choice to remove their reviewer access
 * @param reviewerId the id of the of reviewer which allows us to remove their access
 */
  showModal(reviewerId: string) {
    this.removeReviewerId = reviewerId;
    this.displayRemoveReviewerModal = true;
  }

  /**
   * Removes the reviewer access from a user in a collection
   */
  async removeReviewer() {
    this.displayRemoveReviewerModal = false;
    await this.user.removeMember(this.activeCollection, this.removeReviewerId );
    await this.fetchReviewers();
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
