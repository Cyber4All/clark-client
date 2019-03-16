import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, IterableDiffers, IterableDiffer } from '@angular/core';
import { User } from '@cyber4all/clark-entity';
import { UserService } from 'app/core/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-users',
  templateUrl: './reviewers.component.html',
  styleUrls: ['./reviewers.component.scss']
})
export class ReviewersComponent implements OnInit {
  reviewers: User[];
  activeCollection: string;
  isSearching = false;

  // array of usernames representing all selected users
  selectedReviewers: string[] = [];
  // search query string, modeled to the search
  query: string;
  // true if dropdown results should be shown, false if they should be hidden
  showDropdown: boolean;
  // true if the component is actively querying the services, false otherwise
  loading = false;

  differ: IterableDiffer<User>;

  constructor(
    private user: UserService,
    private router: Router,
    private authService: AuthService,
    private differs: IterableDiffers,
    private route: ActivatedRoute,
  ) {
      // init contributors iterable differ
      this.differ = this.differs.find([]).create(null);
   }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.activeCollection = params['collection'];
      this.fetchReviewers();
   });
  }

  async fetchReviewers() {
    this.loading = true;
    this.reviewers = await this.user.fetchReviewers(this.activeCollection);
    this.loading = false;
    console.log(this.reviewers);
  }

  addReviewer(index: number) {
    console.log(this.reviewers[index]);
  }

  navigateToUserObjects(username: string) {
    this.router.navigate(['admin/learning-objects'], { queryParams: { username } });
  }

}
