import { Component, OnInit } from '@angular/core';
import { User } from '@cyber4all/clark-entity';
import { UserService } from 'app/core/user.service';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'clark-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  searchBarPlaceholder = 'Users';
  users: User[];
  activeCollection: string;
  loading = false;
  displayRemoveReviewerModal = false;
  removeReviewerId: string;

  constructor(
    private user: UserService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.activeCollection = params['collection'];
      if (this.activeCollection !== null && typeof(this.activeCollection) !== 'undefined') {
        this.fetchReviewers();
      }
   });
  }

/**
 * Text search that returns the list of users to add
 * @param text text string to query by
 */
  getUsers(text: string) {
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

}
