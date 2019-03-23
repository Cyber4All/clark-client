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

  getUsers(text: string) {
    this.loading = true;
    this.user.searchUsers(text)
      .then(val => {
        this.users = val;
        this.loading = false;
      });
  }

  async fetchReviewers() {
    this.loading = true;
    this.users = await this.user.fetchReviewers(this.activeCollection, {role: 'reviewer'});
    this.loading = false;
  }

  async addReviewer(user: User) {
    await this.user.assignMember(user.id, this.activeCollection, {role: 'reviewer'});
    await this.fetchReviewers();
  }

  showModal(reviewerId: string) {
    this.removeReviewerId = reviewerId;
    this.displayRemoveReviewerModal = true;
  }

  async removeReviewer() {
    this.displayRemoveReviewerModal = false;
    await this.user.removeMember(this.activeCollection, this.removeReviewerId, {role: 'reviewer'} );
    await this.fetchReviewers();
  }

  navigateToUserObjects(username: string) {
    this.router.navigate(['admin/learning-objects'], { queryParams: { username } });
  }

}
