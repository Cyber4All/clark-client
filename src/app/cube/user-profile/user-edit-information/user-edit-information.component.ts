import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  OnDestroy
} from '@angular/core';
import { UserService } from '../../../core/user.service';
import { AuthService } from '../../../core/auth.service';
import { NotificationService } from '../../../shared/notifications';
import { User } from '@cyber4all/clark-entity';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-edit-information',
  templateUrl: './user-edit-information.component.html',
  styleUrls: ['./user-edit-information.component.scss']
})
export class UserEditInformationComponent implements OnInit, OnChanges {
  elementRef: any;
  @Input('user') user;
  @Input('self') self: boolean = false;
  @Output('close') close = new EventEmitter<boolean>();

  counter = 140;

  editInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: ''
  };

  sub: Subscription; // open subscription to close

  constructor(
    private userService: UserService,
    private noteService: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.editInfo = {
        firstname: this.user.name ? this.user.name.split(' ')[0] : '',
        lastname: this.user.name ? this.user.name.substring(this.user.name.indexOf(' ') + 1) : '',
        email: this.user.email || '',
        organization: this.user.organization || ''
      };
    }
  }
  /**
   * Saves User's information edits
   *
   * @private
   * @memberof UserEditInformationComponent
   */
  private async save() {
    const edits: UserEdit = {
      name: `${this.editInfo.firstname.trim()} ${this.editInfo.lastname.trim()}`,
      email: this.editInfo.email.trim(),
      organization: this.editInfo.organization.trim()
    };
    try {
      await this.userService.editUserInfo(edits);
      await this.auth.validate();
      this.close.emit(true);
      this.noteService.notify(
        'Success!',
        "We've updated your user information!",
        'good',
        'far fa-check'
      );
    } catch (e) {
      this.noteService.notify(
        'Error!',
        "We couldn't update your user information!",
        'bad',
        'far fa-times'
      );
    }
  }
  handleCounter(e) {
    if (e.which === 8 && this.counter !== 140) {
       this.counter++;
    } else if (e.which !== 8 && this.counter !== 0) {
      this.counter--;
    }
  }
}

export type UserEdit = {
  name: string;
  email: string;
  organization: string;
};
