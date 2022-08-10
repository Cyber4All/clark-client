import { Component, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { User } from '@entity';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'clark-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})

export class UserProfileComponent implements OnInit, OnDestroy {
  subscription: ISubscription;
  user: User;
  isUser = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
  ) {}

  async ngOnInit() {
    this.subscription = this.route.data.subscribe(val => {
      this.user = val.user;
    });
    // Check to see if current user is on their profile
    this.isUser = this.user.username === this.auth.username;
  }

  ngOnDestroy() {

  }
}
