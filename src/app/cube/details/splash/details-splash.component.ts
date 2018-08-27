import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { UserService } from '../../../core/user.service';

@Component({
  selector: 'cube-details-splash',
  styleUrls: ['details-splash.component.scss'],
  templateUrl: 'details-splash.component.html'
})
export class DetailsSplashComponent implements OnInit {
  @Input() learningObject: LearningObject;
  contributorsList = [];

  constructor(private userService: UserService) { }

  ngOnInit() {
    if (this.learningObject.contributors) {
      // The array of contributors attached to the learning object contains a
      // list of usernames. We want to display their full names.
      this.getContributors();
    }
  }

  private getContributors() {
    for (const contributor of this.learningObject.contributors) {
      this.userService
        .getUser(contributor)
        .then(val => {
          this.contributorsList.push(val);
        });
    }
  }
}
