import {
  Component,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  Input,
  OnDestroy
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { AuthService } from 'app/core/auth.service';
import { ProfileService } from 'app/core/profiles.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Subject } from 'rxjs';
import { environment } from '@env/environment';

@Component({
  selector: 'clark-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnChanges, OnDestroy {
  ssoRedirect = environment.apiURL + '/google';
  private ngUnsubscribe = new Subject<void>();
  elementRef: any;
  @Input() user;
  @Input() gravatarImage;
  @Output() close: EventEmitter<void> = new EventEmitter();
  errorMsg = 'There was an issue on our end with your registration, we are sorry for the inconvience.\n Please try again later!';
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
    firstname: this.authValidation.getInputFormControl('required'),
    lastname: this.authValidation.getInputFormControl('required'),
    email: this.authValidation.getInputFormControl('email'),
    organization: this.authValidation.getInputFormControl('required'),
  });

  constructor(
    private authValidation: AuthValidationService,
    private profileService: ProfileService,
    private noteService: ToastrOvenService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.authValidation.getErrorState().subscribe(err => this.editFailure = err);
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
      username: this.user.username,
      name: `${this.editInfo.firstname.trim()} ${this.editInfo.lastname.trim()}`,
      email: this.editInfo.email.trim(),
      organization: this.editInfo.organization.trim(),
      bio: this.editInfo.bio.trim(),
    };
    try {
      const profileUpdate = this.profileService.editUserInfo(edits);
      // await Promise.all(profileUpdate).then(async (promise: any) => {
      //   console.log(promise)
      //   if(promise.status === 'fulfilled') {
      //     await this.auth.validateAndRefreshToken();
      //     this.close.next();
      //     this.noteService.success('Success!', 'We\'ve updated your user information!');
      //   }
      // });
    } catch (e) {
      this.authValidation.showError();
      if (e.status === 400) {
        this.noteService.error('Error!', e.error);
      } else {
        this.noteService.error('Error!', 'We couldn\'t update your user information!');
      }
    }
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

  }
}
