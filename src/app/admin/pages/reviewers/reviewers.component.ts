import { Component, OnInit } from '@angular/core';
import { User, Collection } from '@cyber4all/clark-entity';
import { UserService } from 'app/core/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'clark-users',
  templateUrl: './reviewers.component.html',
  styleUrls: ['./reviewers.component.scss']
})
export class ReviewersComponent implements OnInit {
  searchBarPlaceholder = 'Reviewers';
  reviewers: User[];
  collection: Collection[];
  loading = false;
  displaySearchModal = false;
  modalOpenSuccess = false;
  modalOpenFailure = false;

  constructor(private user: UserService, private router: Router) { }

  ngOnInit() {
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

  open(search: boolean) {
    if (search) {
      this.modalOpenSuccess = true;
    } else {
      this.modalOpenFailure = true;
    }
  }

  // check to see if this user is already a reviewer and either add or remove them
  toggleReviewer(user: User) {

  }

  navigateToUserObjects(username: string) {
    this.router.navigate(['admin/learning-objects'], { queryParams: { username } });
  }

}
