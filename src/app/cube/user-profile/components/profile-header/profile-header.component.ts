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
  /**
   * @private _user is an observable that subscribes to the user being set in the parent component
   * Profiles uses a route resolver that fetches a profile when a user's profile is visited. This subscription
   * allows the profile data to be rendered dynamically when visiting a new profile.
   * EXAMPLE:
   * 1. Dr. Taylor is logged into CLARK
   * 2. Dr. Taylor visits Dr. Kaza's profile
   * 3. Dr. Taylor decides to navigate to her profile from Dr. Kaza's profile
   * Without the behavior subject, Dr. Taylor's profile would not render correctly. Dr. Kaza's
   * header would persist through this example
   */
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
