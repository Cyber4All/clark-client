import { Component, Input, OnInit } from '@angular/core';
import { User } from '@entity';
import { UserService } from 'app/core/user.service';

@Component({
  selector: 'clark-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss']
})
export class ProfileHeaderComponent implements OnInit {
  @Input() user: User;
  @Input() isUser: boolean;

  gravatarImage: string;
  size = 200;
  anyUserStats = false;
  editProfile = false;
  savedObjects: number;
  contributedObjects: number;
  downloadedObjects: number;

  constructor(
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.getUserBio();
    this.checkUserStats();
    // Get user profile image
    this.gravatarImage = this.userService.getGravatarImage(this.user.email, this.size);
  }

  /**
   * Function to retrieve stats of user interactions
   */
  checkUserStats() {
    // Check saved
  }

  /**
   * Function to retrieve a user's bio
   */
  getUserBio() {
    this.userService.getUser(this.user.username, 'username').then(val => {
      this.user = val;
    });
  }
}
