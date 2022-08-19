import { Component, Input, OnInit } from '@angular/core';
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
  ) {}

  async ngOnInit() {
    this._user.subscribe(async val => {
      // Set profile image
      this.gravatarImage = await this.userService.getGravatarImage(val.email, this.size);
      // Grab first name for bio section
      this.firstName = val.name.split(' ')[0];
      await this.checkUserStats();
    });

  }

  /**
   * Function to retrieve stats of user interactions
   */
  async checkUserStats() {
    // Check saved
  }

  /**
   * Method to toggle edit profile view
   *
   * @param val boolean for toggle
   */
  toggleEditProfileModal(val: boolean) {
    this.editProfile = val;
  }
}
