import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  OnDestroy,
} from '@angular/core';
import { UserService } from '../../../core/user.service';
import { AuthService } from '../../../core/auth.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Subscription, Subject } from 'rxjs';
import { COPY } from './user-edit-information.copy';



@Component({
  selector: 'cube-app-user-edit-information',
  templateUrl: './user-edit-information.component.html',
  styleUrls: ['./user-edit-information.component.scss']
})

export class UserEditInformationComponent implements OnInit, OnChanges, OnDestroy {
  copy = COPY;
  isDestroyed$ = new Subject<void>();
  elementRef: any;
  @Input() user;
  @Input() self = false;
  @Output() close = new EventEmitter<boolean>();

  counter = 140;

  editInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
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
    private noteService: ToastrOvenService,
    private auth: AuthService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.editInfo = {
        firstname: this.toUpper(this.user.name) ? this.toUpper(this.user.name.split(' ')[0]) : '',
        lastname: this.toUpper(this.user.name) ? this.toUpper(this.user.name.substring(this.user.name.indexOf(' ') + 1)) : '',
        email: this.user.email || '',
        organization: this.toUpper(this.user.organization) || '',
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
    const edits: UserEdit = {
      name: `${this.editInfo.firstname.trim()} ${this.editInfo.lastname.trim()}`,
      email: this.editInfo.email.trim(),
      organization: this.editInfo.organization.trim(),
      bio: this.editInfo.bio.trim(),
      username: this.user.username
    };
    try {
      await this.userService.editUserInfo(edits);
      await this.auth.validateAndRefreshToken();
      this.close.emit(true);
      this.noteService.success('Success!', 'We\'ve updated your user information!');
    } catch (e) {
      this.noteService.error('Error!', 'We couldn\'t update your user information!');
    }
  }

  handleCounter(e) {
    const inputLength = this.editInfo.bio.length;
    this.counter = 140 - inputLength;
  }

  private toUpper(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');
  }

  ngOnDestroy() {
     this.isDestroyed$.next();
     this.isDestroyed$.unsubscribe();
  }
}



export interface UserEdit {
  name: string;
  email: string;
  organization: string;
  bio: string;
  username: string;
}
