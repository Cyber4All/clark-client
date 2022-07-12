import { Component, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { User } from '@entity';

@Component({
  selector: 'clark-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})

export class UserProfileComponent implements OnInit, OnDestroy {
  subscription: ISubscription;
  user: User;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.subscription = this.route.data.subscribe(val => {
      this.user = val.user;
    })
  }

  ngOnDestroy() {

  }
}
