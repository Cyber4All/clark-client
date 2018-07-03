import { UserService } from './../../core/user.service';
import { USER_ROUTES } from '../../../environments/route';
import { Component, OnInit, OnDestroy} from '@angular/core';
import { LearningObjectService } from '../learning-object.service';
import { AuthService } from '../../core/auth.service';
import { LearningObject, User } from '@cyber4all/clark-entity';
import { UserInformationComponent } from './user-information/user-information.component';
import { UserEditInformationComponent } from './user-edit-information/user-edit-information.component';
import { ModalService, ModalListElement } from '../../shared/modals';
import { ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import * as md5 from 'md5';

@Component({
  selector: 'clark-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})

export class UserProfileComponent implements OnInit, OnDestroy {
  user: User;
  subscription: ISubscription;
  self= false;
  myStyle;
  height = 100;
  width = 100;
  size = 200;
  gravatarImage: string;
  editContent = false;

  constructor(
    private learningObjectService: LearningObjectService,
    private userService: UserService,
    private auth: AuthService,
    private modalService: ModalService,
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
      this.user = this.auth.user;
    }
  }

  // Used to retrieve user object that contains a bio
  private getUser() {
    this.userService.getUser(this.user.username).then(val => {
      this.user = val;
    });
  }
}
