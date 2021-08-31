import { UserService } from '../../core/user.service';
import { Component, OnInit, OnDestroy} from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { User } from '@entity';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { COPY } from './user-profile.copy';

@Component({
  selector: 'clark-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})

export class UserProfileComponent implements OnInit, OnDestroy {
  copy = COPY;
  user: User;
  subscription: ISubscription;
  self = false;
  myStyle;
  height = 100;
  width = 100;
  size = 200;
  gravatarImage: string;
  editContent = false;

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // get data from resolve
    this.subscription = this.route.data.subscribe(val => {
      // Get user object for username and provide username in getUser()
      this.user = val.user;
      this.getUser();
      this.self = this.user.username === this.auth.username;
      this.gravatarImage = this.userService.getGravatarImage(this.user.email, this.size);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  closeEdit(changed: boolean = false) {
    this.editContent = false;
    if (changed) {
      this.getUser();
    }
  }

  // Used to retrieve user object that contains a bio
  private getUser() {
    this.userService.getUser(this.user.username, 'username').then(val => {
      this.user = val;
    });
  }
}
