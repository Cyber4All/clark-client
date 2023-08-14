import {
  Component,
  OnChanges,
  OnInit,
  EventEmitter,
  Output,
  Input
} from '@angular/core';
import { FormControl, Validators, FormGroup} from '@angular/forms';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { AuthService } from 'app/core/auth.service';
import { ProfileService } from 'app/core/profiles.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { environment } from '@env/environment';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user.service';

@Component({
  selector: 'clark-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnChanges, OnInit {
  ssoRedirect = environment.apiURL + '/google';
  elementRef: any;
  @Input() user;
  @Input() gravatarImage;
  @Output() close: EventEmitter<void> = new EventEmitter();
  @Output() userInfo: EventEmitter<{}> = new EventEmitter();
  fieldErrorMsg = '';
  editFailure: Boolean = false;
  emailInUse = false;
  loading = false;
  editInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
    bio: ''
  };

  editFormGroup: FormGroup = new FormGroup({
  });

  constructor(
    private authValidation: AuthValidationService,
    private profileService: ProfileService,
    private noteService: ToastrOvenService,
    private auth: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.editFormGroup = new FormGroup ({
      firstname: new FormControl(this.user.name, Validators.required),
      lastname: new FormControl(this.user.name, Validators.required),
      email: new FormControl(this.user.email, Validators.required),
      organization: new FormControl(this.user.organization, Validators.required),
    });
  }


  ngOnChanges(): void {
    this.authValidation.getErrorState().subscribe(err => this.editFailure = err);
    this.editInfo = {
      firstname: this.toUpper(this.auth.firstName),
      lastname: this.toUpper(this.auth.lastName),
      email: this.user.email || '',
      organization: this.toUpper(this.user.organization) || '',
      bio: this.user.bio || ''
    };
  }

  /**
   * Saves User's information edits
   *
   * @private
   * @memberof UserEditInformationComponent
   */
  async save() {
    const edits = {
      username: this.user.username,
      name: this.userService.combineName(this.editInfo.firstname, this.editInfo.lastname),
      email: this.editInfo.email.trim(),
      organization: this.editInfo.organization.trim(),
      bio: this.editInfo.bio.trim(),
    };
    if(
      this.editInfo.firstname === ''
      || this.editInfo.lastname === ''
      || this.editInfo.email === ''
      || this.editInfo.organization === ''
      || !this.getValidEmail(this.editInfo.email)
    ) {
      this.noteService.error('Error!', 'Double check the required fields above!');
      return;
    }

    try {
      await this.profileService.editUserInfo(edits).then(async res => {
        await this.auth.validateAndRefreshToken();
        this.userInfo.next(edits);
        this.close.next();
        this.noteService.success('Success!', res);
      });
    } catch (e) {
      // FIXME: No errors are being caught/thrown from user service
      if (e.status === 400) {
        this.noteService.error('Error!', e.error);
      } else {
        this.noteService.error('Error!', 'We couldn\'t update your user information!');
      }
    }
  }

  /**
   * Function to capitalize specific characters
   *
   * @param str any text string needing capitalization
   * @returns formatted string
   */
  private toUpper(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');
  }

  /**
   * Private function to validate email regex
   *
   * @param inputEmail user email
   * @returns boolean
   */
  private getValidEmail(inputEmail: string) {
    const email =
      inputEmail.match(
        // eslint-disable-next-line max-len
        /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g
      ) !== null;
    return email;
  }
}
