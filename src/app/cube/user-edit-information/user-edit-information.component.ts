import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output
} from '@angular/core';
import { UserService } from '../../core/user.service';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../shared/notifications';

@Component({
  selector: 'app-user-edit-information',
  templateUrl: './user-edit-information.component.html',
  styleUrls: ['./user-edit-information.component.scss']
})
export class UserEditInformationComponent implements OnInit, OnChanges {
  @Input('user') user;
  @Output('close') close = new EventEmitter<boolean>();

  editInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: ''
  };

  constructor(
    private userService: UserService,
    private noteService: NotificationService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.editInfo = {
        firstname: this.user.name ? this.user.name.split(' ')[0] : '',
        lastname: this.user.name ? this.user.name.split(' ')[1] : '',
        email: this.user.email || '',
        organization: this.user.organization || ''
      };
    }
  }

  save() {
    const concatInfo: UserEdit = {
      name: `${this.editInfo.firstname} ${this.editInfo.lastname}`,
      email: this.editInfo.email,
      organization: this.editInfo.organization
    };

    this.userService.editUserInfo(concatInfo).then(
      val => {
        this.close.emit(true);
        this.noteService.notify(
          'Success!',
          "We've updated your user information!",
          'good',
          'far fa-check'
        );
      },
      error => {
        this.noteService.notify(
          'Error!',
          "We couldn't update your user information!",
          'bad',
          'far fa-times'
        );
      }
    );
  }
}

export type UserEdit = {
  name: string;
  email: string;
  organization: string;
};
