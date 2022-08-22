import { Component, Input, OnInit } from '@angular/core';
import { ProfileService } from 'app/core/profiles.service';
import { UserService } from 'app/core/user.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'clark-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss']
})
export class ProfileHeaderComponent implements OnInit {
  private _user = new BehaviorSubject<any>({});
  @Input() set user(user: any) {
    this._user.next(user);
  }
  get user() {
    return this._user.value;
  }
  // Toggle disply edit profile button for authenticated user
  @Input() isUser: boolean;

  gravatarImage: string;
  size = 200;
  anyUserStats = false;
  editProfile = false;
  savedObjects: number;
  contributedObjects: number;
  downloadedObjects: number;
  firstName: string;

  constructor(
    private userService: UserService,
    private profileService: ProfileService
  ) {}

  async ngOnInit() {
    this._user.subscribe(async val => {
      // Set profile image
      this.gravatarImage = await this.userService.getGravatarImage(val.email, this.size);
      // Grab first name for bio section
      this.firstName = val.name.split(' ')[0];
    });

  }

  /**
   * Function to retrieve stats of user interactions on downloads, contributions, and saves
   */
  async checkUserStats() {
    // TODO -- create aggregation for user downloads, user contributions, and saved objects
  }

  /**
   * Method to update user info from service after changes have been made
   */
  async updateInfo() {
    this.user = await this.profileService.fetchUserProfile(this.user.username);
  }

  /**
   * Method to toggle off edit profile view
   */
   closeEdit() {
    this.editProfile = false;
  }
}
