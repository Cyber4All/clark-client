import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  EventEmitter,
  Output,
  Input
} from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { UserService } from 'app/core/user.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Subscription, Subject } from 'rxjs';

@Component({
  selector: 'clark-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, OnChanges, OnDestroy {
  isDestroyed$ = new Subject<void>();
  elementRef: any;
  @Input() user;
  @Input() gravatarImage;
  @Output() close = new EventEmitter<boolean>();

  editInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
    bio: ''
  };

  constructor(
    private userService: UserService,
    private noteService: ToastrOvenService,
    private auth: AuthService
  ) { }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
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
    const edits = {
      name: `${this.editInfo.firstname.trim()} ${this.editInfo.lastname.trim()}`,
      email: this.editInfo.email.trim(),
      organization: this.editInfo.organization.trim(),
      bio: this.editInfo.bio.trim(),
      username: this.user.username
    };
    try {
      if (this.getValidEmail(edits.email) === false) {
        throw {'error': 'invalid email'};
      }
      await this.userService.editUserInfo(edits);
      await this.auth.validateAndRefreshToken();
      this.close.emit(true);
      this.noteService.success('Success!', 'We\'ve updated your user information!');
    } catch (e) {
      if (e.status === 400) {
        this.noteService.error('Error!', e.error);
      } else {
        this.noteService.error('Error!', 'We couldn\'t update your user information!');
      }
    }
  }

  getValidEmail(inputEmail: string) {
    const email =
      inputEmail.match(
        // eslint-disable-next-line max-len
        /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g
      ) !== null;
    return email;
  }

  bindEditorOutput(event: Event) {

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

  ngOnDestroy(): void {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }
}
