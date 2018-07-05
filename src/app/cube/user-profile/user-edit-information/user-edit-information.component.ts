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
  @Input() user;
  @Input() self = false;
  @Output('close') close = new EventEmitter<boolean>();
  @ViewChild('confirmNewPasswordInput', { read: ElementRef })
  confirmNewPasswordInput: ElementRef;
  @ViewChild('originalPasswordInput', { read: ElementRef })
  originalPasswordInput: ElementRef;
  @ViewChild('organization', { read: ElementRef })
  organization: ElementRef;

  counter = 140;

  newPassword = '';
  confirmPassword = '';

  isPasswordMatch;
  organizationsList = [];
  isValidOrganization: boolean;

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

  // array of subscriptions to destroy on component destroy
  subs: Subscription[] = [];

  constructor(
    private userService: UserService,
    private noteService: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.subs.push(Observable.fromEvent(this.originalPasswordInput.nativeElement, 'input')
    .debounceTime(650)
    .subscribe(val => {
      this.isCorrectPassword().then(res => {
        if (res) {
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
    })
  );
    // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.subs.push(Observable.fromEvent(this.confirmNewPasswordInput.nativeElement, 'input')
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
      })
    );
      // listen for input events on the income input and send text to suggestion component after 650 ms of debounce
    this.subs.push(Observable.fromEvent(this.organization.nativeElement, 'input')
      .debounceTime(400)
      .subscribe(val => {
          this.getOrganizations();
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.editInfo = {
        firstname: this.user.name ? this.user.name.split(' ')[0] : '',
        lastname: this.user.name ? this.user.name.substring(this.user.name.indexOf(' ') + 1) : '',
        email: this.user.email || '',
        organization: this.user.organization || '',
        password: this.confirmPassword,
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
  async save() {
    // If the new password fields do not match, the user cannot save changes.
    // If the user does not wish to change their password, the fields will
    // match when empty.
    if (this.confirmNewPassword()) {
      // If the user doesn't provide an email in this form, we need to
      // get the account's email in order to update the password.
      await this.saveUserEdits();
      // If a new password is not provided, do not update password.
    } else {
      this.noteService.notify(
        'Invalid Entry',
        'Passwords must match',
        'bad',
        'far fa-times'
      );
    }
  }

  private async saveUserEdits() {
    const edits: UserEdit = {
      name: `${this.editInfo.firstname.trim()} ${this.editInfo.lastname.trim()}`,
      email: this.editInfo.email.trim(),
      organization: this.editInfo.organization.trim(),
      password: this.editInfo.password.trim(),
      bio: this.editInfo.bio.trim()
    };
    if (await this.checkOrganization()) {
      try {
        // Store organization in lower case
        edits.organization = edits.organization.toLowerCase();
        await this.userService.editUserInfo(edits);
        await this.auth.validate();
        this.close.emit(true);
        this.noteService.notify('Success!', 'We\'ve updated your user information!', 'good', 'far fa-check');
      } catch (e) {
        this.noteService.notify('Error!', 'We couldn\'t update your user information!', 'bad', 'far fa-times');
      }
    } else {
      this.noteService.notify('Invalid Organization!', 'Please select a provided orgnization from the dropdown!', 'bad', 'far fa-times');
    }
  }

  handleCounter(e) {
    const inputLength = this.editInfo.bio.length;
    this.counter = 140 - inputLength;
  }

  async isCorrectPassword() {
    this.isPasswordMatch = false;
    this.userInfo.username = this.user.username;
    try {
      // Provide checkPassword with an object that contains username
      // and user-provided password
      this.isPasswordMatch = await this.auth.checkPassword(this.userInfo);
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
      this.editInfo.password = this.confirmPassword;
      return true;
    }
    return false;
  }

  getOrganizations() {
    this.auth.getOrganizations(this.editInfo.organization).then(val => {
        // Display top 5 matching organizations
        for (let i = 0; i < 5; i++) {
          if (val[i]) {
            this.organizationsList[i] = val[i]['institution'];
          }
        }
        // If no results, destroy results display
        if (!val[0]) {
          this.organizationsList = [];
        }
        // If no query, destroy results display
        if (this.editInfo.organization === '') {
          this.organizationsList = [];
        }
    });
  }

  chooseOrganization(organization: string) {
    this.editInfo.organization = organization;
  }

  async checkOrganization() {
    // Allow the user to enter an org that does not exist in our
    // database when empty results are returned
    if (this.organizationsList.length > 0) {
      const isValidOrganization = await this.auth.checkOrganization(this.editInfo.organization);
      return isValidOrganization['isValid'];
    } else {
      return true;
    }
  }

  ngOnDestroy() {
     // unsubscribe from all observables
     for (let i = 0, l = this.subs.length; i < l; i++) {
      this.subs[i].unsubscribe();
    }
  }
}

export interface UserEdit {
  name: string;
  email: string;
  organization: string;
  password: string;
  bio: string;
}
