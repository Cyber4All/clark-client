import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this._user.subscribe(async val => {
      this.gravatarImage = await this.userService.getGravatarImage(val.email, this.size);
      this.firstName = val.name.split(' ')[0];
      this.checkUserStats();
    });

  }

  /**
   * Function to retrieve stats of user interactions
   */
  checkUserStats() {
    // Check saved
  }

  toggleEditProfileModal(val: boolean) {
    this.editProfile = val;
  }
}
