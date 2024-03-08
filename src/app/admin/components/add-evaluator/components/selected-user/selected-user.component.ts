import { Component, Input, OnInit } from '@angular/core';
import { User } from '@entity';
import { UserService } from 'app/core/user-module/user.service';

@Component({
  selector: 'clark-selected-user',
  templateUrl: './selected-user.component.html',
  styleUrls: ['./selected-user.component.scss']
})
export class SelectedUserComponent implements OnInit {

  @Input() user: User;

  constructor(private userService: UserService) {}

  ngOnInit(): void {}

  /**
   * Retrieve the gravatar image for the card's user
   *
   * @returns
   * @memberof AdminUserCardComponent
   */
  getGravatar() {
    return this.userService.getGravatarImage(
      this.user.email,
      200,
    );
  }

}
