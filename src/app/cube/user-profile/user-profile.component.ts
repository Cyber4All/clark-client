import { UserService } from '../../core/user.service';
import { Component, OnInit, OnDestroy} from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'clark-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})

export class UserProfileComponent implements OnInit, OnDestroy {

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {

  }

  ngOnDestroy() {

  }
}
