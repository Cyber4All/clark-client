import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthValidationService } from 'app/core/auth-module/auth-validation.service';
import { AUTH_ROUTES } from 'app/core/auth-module/auth.routes';
import { AuthService } from 'app/core/auth-module/auth.service';
import { OrganizationService } from 'app/core/organization-module/organization.service';
import { OrganizationStore } from 'app/core/organization-module/organization.store';
import { Organization } from 'app/core/organization-module/organization.types';
import { UserService } from 'app/core/user-module/user.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Subject } from 'rxjs';
import { debounceTime, take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnChanges, OnInit, OnDestroy {
  ssoRedirect = AUTH_ROUTES.GOOGLE_SIGNUP();
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

  editFormGroup: UntypedFormGroup = new UntypedFormGroup({
  });

  organizationInput$: Subject<string> = new Subject<string>();
  private destroyed$ = new Subject<void>();
  showDropdown = false;
  closeDropdown = () => {
    this.showDropdown = false;
  };
  searchResults: Array<Organization> = [];
  selectedOrg = '';

  constructor(
    private authValidation: AuthValidationService,
    private noteService: ToastrOvenService,
    private auth: AuthService,
    private userService: UserService,
    private orgService: OrganizationService,
    public orgStore: OrganizationStore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.editFormGroup = new UntypedFormGroup({
      firstname: new UntypedFormControl(this.user.name, Validators.required),
      lastname: new UntypedFormControl(this.user.name, Validators.required),
      email: new UntypedFormControl(this.user.email, Validators.required),
      organization: new UntypedFormControl('', Validators.required),
    });
    this.organizationInput$
      .pipe(debounceTime(650), takeUntil(this.destroyed$))
      .subscribe((value: string) => {
        this.orgService.searchOrganizations({ text: value.trim() }).pipe(take(1)).subscribe((results) => {
          this.searchResults = results;
          this.loading = false;
        });
      });
    this.organizationInput$.pipe(takeUntil(this.destroyed$)).subscribe((value: string) => {
      if (value && value !== '') {
        this.selectedOrg = '';
        this.showDropdown = true;
        this.loading = true;
      } else {
        this.showDropdown = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnChanges(): void {
    this.authValidation.getErrorState().subscribe(err => this.editFailure = err);
    const name = this.user.name.split(' ');
    let firstName = '', lastName = '';
    if (name.length > 2) {
      firstName = name[0] + ' ' + name[1];
      for (let i = 2; i < name.length; i++) {
        lastName += name[i] + ' ';
      }
    } else {
      firstName = name[0];
      lastName = name[1];
    }
    this.selectedOrg = this.user.organizationId || '';
    this.editInfo = {
      firstname: this.toUpper(firstName),
      lastname: this.toUpper(lastName),
      email: this.user.email || '',
      organization: '',
      bio: this.user.bio || ''
    };
    this.orgStore.organizationName$(this.user.organizationId).pipe(take(1)).subscribe((nameValue) => {
      this.editInfo.organization = nameValue;
      this.editFormGroup.get('organization')?.setValue(nameValue);
    });
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
      name: this.userService.combineName(this.editInfo.firstname, this.editInfo.lastname, true),
      email: this.editInfo.email.trim(),
      organizationId: this.selectedOrg,
      bio: this.editInfo.bio.trim(),
    };
    if (
      this.editInfo.firstname === ''
      || this.editInfo.lastname === ''
      || this.editInfo.email === ''
      || this.editInfo.organization === ''
      || this.selectedOrg === ''
      || !this.getValidEmail(this.editInfo.email)
    ) {
      this.noteService.error('Error!', 'Double check the required fields above!');
      return;
    }

    const changedFields: any = {};
    if (edits.name !== this.user.name) {
      changedFields.name = edits.name;
    }
    if (edits.email !== this.user.email) {
      changedFields.email = edits.email;
    }
    if (edits.organizationId !== this.user.organizationId) {
      changedFields.organizationId = edits.organizationId;
    }
    if (edits.bio !== this.user.bio) {
      changedFields.bio = edits.bio;
    }

    // Always include the username for identification
    changedFields.username = this.user.username;

    try {
      await this.userService.editUserInfo(changedFields).then(async res => {
        await this.auth.validateToken();
        this.userInfo.next(edits);
        this.close.next();
        this.noteService.success('Success!', 'Information updated');
      });
    } catch (e) {
      // FIXME: No errors are being caught/thrown from user service
      if (e.status === 400) {
        this.noteService.error('Error!', JSON.parse(e.error).message);
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
    str = str.trim();
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => {
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

  /**
   * Selects an organization from the list
   *
   * @param org The organization selected
   */
  selectOrg(org?: Organization) {
    if (org) {
      this.editInfo.organization = org.name;
      this.selectedOrg = org._id;
      this.editFormGroup.get('organization')!.setValue(org.name);
    } else {
      this.editInfo.organization = 'Other';
      this.selectedOrg = '602ae2a038e2aaa1059f3c39';
      this.editFormGroup.get('organization')!.setValue('Other');
    }
    this.closeDropdown();
  }

  /**
   * Registers typing events from the organization input
   *
   * @param event The typing event
   */
  keyup(event: any) {
    this.organizationInput$.next(event.target.value);
  }
}
