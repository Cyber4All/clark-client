import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { UserService } from '../../../core/user.service';
import { AuthService } from '../../../core/auth.service';
import { NotificationService } from '../../../shared/notifications';
import { User } from '@cyber4all/clark-entity';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-user-edit-information',
  templateUrl: './user-edit-information.component.html',
  styleUrls: ['./user-edit-information.component.scss']
})
export class UserEditInformationComponent implements OnInit, OnChanges, OnDestroy {
  elementRef: any;
  @Input('user') user;
  @Input('self') self: boolean = false;
  @Output('close') close = new EventEmitter<boolean>();
  @ViewChild('confirmNewPasswordInput', { read: ElementRef })
  confirmNewPasswordInput: ElementRef;
  @ViewChild('originalPasswordInput', { read: ElementRef })
  originalPasswordInput: ElementRef;

  counter = 140;

  newPassword = '';
  confirmPassword = '';

  isPasswordMatch;

  editInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
    password: '',
    bio: ''
  };

  userInfo = {
    username: '',
    password: ''
  };

  sub: Subscription; // open subscription to close
  sub2: Subscription; // open subscription to close

  constructor(
    private userService: UserService,
    private noteService: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.sub2 = Observable.fromEvent(this.originalPasswordInput.nativeElement, 'input')
    .debounceTime(650)
    .subscribe(val => {
      this.isCorrectPassword().then(res => {
        if (res) {
          this.editInfo.password = this.confirmPassword;
          this.noteService.notify(
            'Valid Entry',
            'Password is correct',
            'good',
            'far fa-check'
          );
        } else {
          this.noteService.notify(
            'Invalid Entry',
            'Password is incorrect',
            'bad',
            'far fa-times'
          );
        }
      });
    });
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.sub = Observable.fromEvent(this.confirmNewPasswordInput.nativeElement, 'input')
      .debounceTime(650)
      .subscribe(val => {
        if (this.confirmNewPassword()) {
          this.noteService.notify(
            'Valid Entry',
            'Passwords match',
            'good',
            'far fa-check'
          );
        } else {
          this.noteService.notify(
            'Invalid Entry',
            'Passwords must match',
            'bad',
            'far fa-times'
          );
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.editInfo = {
        firstname: this.user.name ? this.user.name.split(' ')[0] : '',
        lastname: this.user.name ? this.user.name.substring(this.user.name.indexOf(' ') + 1) : '',
        email: this.user.email || '',
        organization: this.user.organization || '',
        password: '',
        bio: this.user.bio || ''
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
      organization: this.editInfo.organization.trim(),
      
      bio: this.editInfo.bio.trim()
    };
    try {
      await this.userService.editUserInfo(edits);
      await this.auth.validate();
      this.close.emit(true);
      this.noteService.notify(
        'Success!',
        'We\'ve updated your user information!',
        'good',
        'far fa-check'
      );
    } catch (e) {
      this.noteService.notify(
        'Error!',
        'We couldn\'t update your user information!',
        'bad',
        'far fa-times'
      );
    }
  }
  handleCounter(e) {
    const inputLength = this.editInfo.bio.length;
    this.counter = 140 - inputLength;
    console.log(this.editInfo.bio);
  }

  async isCorrectPassword() {
    this.isPasswordMatch = false;
    this.userInfo.username = this.user.username;
    try {
      // Provide checkPassword with an object that contains username
      // and user-provided password
      this.isPasswordMatch = await this.auth.checkPassword(this.userInfo);
      console.log(this.isPasswordMatch);
    } catch (e) {
      this.noteService.notify(
        'Invalid Entry',
        'Password is incorrect',
        'bad',
        'far fa-times'
      );
    }
    return this.isPasswordMatch;
  }

  confirmNewPassword() {
    if (this.newPassword === this.confirmPassword) {
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.sub2.unsubscribe();
  }
}

export type UserEdit = {
  name: string;
  email: string;
  organization: string;
  bio: string;
};
