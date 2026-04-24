import { animate, keyframes, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthValidationService } from 'app/core/auth-module/auth-validation.service';
import { AUTH_ROUTES } from 'app/core/auth-module/auth.routes';
import { AuthService } from 'app/core/auth-module/auth.service';
import { CookieAgreementService } from 'app/core/auth-module/cookie-agreement.service';
import { OrganizationService } from 'app/core/organization-module/organization.service';
import {
  CreateOrganizationResponse,
  ORGANIZATION_LEVELS,
  ORGANIZATION_SECTORS,
  Organization,
  OrganizationLevel,
  OrganizationSector,
  SuggestDomainResponse
} from 'app/core/organization-module/organization.types';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
import {
  COUNTRY_OPTIONS,
  US_STATE_OPTIONS
} from './register-location-options';
import { Subject, interval } from 'rxjs';
import { debounce, debounceTime, take, takeUntil } from 'rxjs/operators';

const EMAIL_REGEX =
  // eslint-disable-next-line max-len
  /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

@Component({
  selector: 'clark-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  animations: [
    trigger('slideInRight', [
      transition('* => *', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('400ms', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition('* => *', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('400ms', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ]),

    trigger('fallFromTop', [
      transition('* => *', [
        query(':enter', style({ opacity: 0 }), { optional: true }),

        query(
          ':enter',
          stagger('300ms', [
            animate(
              '.6s ease-in',
              keyframes([
                style({ opacity: 0, transform: 'translateY(-75%)', offset: 0 }),
                style({
                  opacity: 0.5,
                  transform: 'translateY(35px)',
                  offset: 0.3
                }),
                style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 })
              ])
            )
          ]),
          { optional: true }
        )
      ])
    ])
  ]
})
export class RegisterComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private latestSuggestionEmail = '';
  ssoRedirect = AUTH_ROUTES.GOOGLE_SIGNUP();

  TEMPLATES = {
    info: { temp: 'info', index: 1 },
    organization: { temp: 'organization', index: 2 },
    account: { temp: 'account', index: 3 },
    submission: { temp: 'submission', index: 4 },
    sso: { temp: 'sso', index: 5 }
  };

  currentTemp = 'info';
  currentIndex = 1;

  registrationFailure: Boolean = false;
  verified = false;
  siteKey = '6LeSYEgqAAAAAKdWhPf0KMhnuhdpI408NjptJtwx';
  errorMsg = 'There was an issue on our end with your registration, we are sorry for the inconvience.\n Please try again later!';
  fieldErrorMsg = '';
  redirectUrl;

  slide: boolean;
  fall = false;

  regInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: '',
    username: ''
  };

  buttonGuards = {
    isInfoPageInvalid: true,
    isOrganizationPageInvalid: true,
    isRegisterPageInvalid: true
  };

  organizationContinueAttempted = false;

  infoFormGroup: UntypedFormGroup;
  organizationFormGroup: UntypedFormGroup;
  accountFormGroup: UntypedFormGroup;

  emailInUse = false;
  usernameInUse = false;
  emailLoading = false;
  usernameLoading = false;
  organizationSearchLoading = false;
  organizationSuggestionLoading = false;
  organizationCreationLoading = false;
  shouldCreateOrganization = false;
  createdOrganizationId = '';

  readonly sectorOptions = ORGANIZATION_SECTORS;
  readonly levelOptions = ORGANIZATION_LEVELS;
  readonly countryOptions = COUNTRY_OPTIONS;
  readonly usStateOptions = US_STATE_OPTIONS;

  organizationInput$: Subject<string> = new Subject<string>();
  showDropdown = false;
  suggestedOrganization: Organization | null = null;
  closeDropdown = () => {
    this.showDropdown = false;
  };
  searchResults: Array<Organization> = [];
  selectedOrg = '';
  scrollerHeight = '100px';

  get loading(): boolean {
    return this.emailLoading
      || this.usernameLoading
      || this.organizationSearchLoading
      || this.organizationSuggestionLoading
      || this.organizationCreationLoading;
  }

  get canEnterCustomOrganizationFlow(): boolean {
    return this.infoFormGroup.get('firstname')!.valid
      && this.infoFormGroup.get('lastname')!.valid
      && this.infoFormGroup.get('email')!.valid
      && !this.loading;
  }

  constructor(
    public authValidation: AuthValidationService,
    private auth: AuthService,
    private router: Router,
    private orgService: OrganizationService,
    private cookieAgreement: CookieAgreementService,
    private route: ActivatedRoute,
  ) {
    this.infoFormGroup = new UntypedFormGroup({
      firstname: this.authValidation.getInputFormControl('required'),
      lastname: this.authValidation.getInputFormControl('required'),
      email: this.authValidation.getInputFormControl('email'),
      organization: this.authValidation.getInputFormControl('required'),
    });
    this.organizationFormGroup = new UntypedFormGroup({
      name: new UntypedFormControl('', Validators.required),
      sector: new UntypedFormControl('', Validators.required),
      levels: new UntypedFormControl([]),
      state: new UntypedFormControl({ value: '', disabled: true }),
      country: new UntypedFormControl('', Validators.required),
    });
    this.accountFormGroup = new UntypedFormGroup({
      username: this.authValidation.getInputFormControl('username'),
      password: this.authValidation.getInputFormControl('password'),
      confirmPassword: this.authValidation.getInputFormControl('required'),
      captcha: new UntypedFormControl()
    }, MatchValidator.mustMatch('password', 'confirmPassword'));

    this.route.parent.data.subscribe(() => {
      if (this.route.snapshot.queryParams.redirectUrl) {
        this.redirectUrl = decodeURIComponent(this.route.snapshot.queryParams.redirectUrl);
      }
      if (this.route.snapshot.queryParams.err) {
        this.authValidation.showError();
      }
    });
  }

  ngOnInit(): void {
    this.authValidation.getErrorState().subscribe(err => this.registrationFailure = err);
    this.toggleInfoNextButton();
    this.toggleOrganizationNextButton();
    this.toggleRegisterButton();
    this.watchOrganizationCountry();
    this.validateEmail();
    this.validateUsername();
    this.organizationInput$.pipe(debounceTime(650))
      .subscribe((value: string) => {
        this.orgService.searchOrganizations({ text: value.trim() }).pipe(take(1)).subscribe({
          next: (results) => {
            this.searchResults = results;
            this.organizationSearchLoading = false;
          },
          error: () => {
            this.searchResults = [];
            this.organizationSearchLoading = false;
          }
        });
      });
    this.organizationInput$
      .subscribe((value: string) => {
        if (value && value !== '') {
          this.selectedOrg = '';
          this.suggestedOrganization = null;
          this.showDropdown = true;
          this.organizationSearchLoading = true;
        } else {
          this.selectedOrg = this.suggestedOrganization?._id ?? '';
          this.regInfo.organization = this.suggestedOrganization?.name ?? '';
          this.showDropdown = false;
          this.organizationSearchLoading = false;
        }
      });
  }

  /**
   * Register a user
   */
  public async submit(): Promise<void> {
    try {
      if (this.shouldCreateOrganization && !this.createdOrganizationId) {
        await this.createCustomOrganization();
      }

      await this.auth.register({
        username: this.regInfo.username.trim(),
        firstname: this.regInfo.firstname.trim(),
        lastname: this.regInfo.lastname.trim(),
        email: this.regInfo.email.trim(),
        organizationId: this.selectedOrg,
        password: this.regInfo.password
      });
      this.nextTemp();
    } catch (error) {
      const parsedErrorMessage = this.getErrorMessage(error);
      if (parsedErrorMessage && parsedErrorMessage !== 'Internal Server Error') {
        this.errorMsg = parsedErrorMessage;
      }
      this.authValidation.showError();
    }
  }

  /**
   * Takes the user back to the home page
   */
  navigateHome() {
    if (this.redirectUrl) {
      window.location = this.redirectUrl;
      return;
    }
    this.router.navigate(['home']);
  }

  /**
   * Validates the username ensuring it is not already taken
   */
  private validateUsername() {
    this.accountFormGroup.get('username').valueChanges
      .pipe(
        debounce(() => {
          // Greys out the Register button while communicating with backend
          this.usernameLoading = true;
          return interval(600);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(async (value) => {
        this.usernameLoading = false;
        await this.auth.usernameInUse(value)
          .catch((err) => {
            this.authValidation.showError();
          })
          .then((res: any) => {
            this.usernameInUse = res.identifierInUse;
            if (this.usernameInUse) {
              this.accountFormGroup.get('username').setErrors({
                inUse: true
              });
              this.fieldErrorMsg = 'This username is already in use';
            } else {
              this.fieldErrorMsg = '';
            }
          });
      });
  }

  /**
   * Validates the email by ensuring it does not already exists in the database
   * and uses the regex to validate it
   */
  private validateEmail() {
    this.infoFormGroup.get('email').valueChanges
      .pipe(
        debounce(() => {
          this.emailLoading = true;
          return interval(600);
        }),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(async (value) => {
        this.emailLoading = false;
        this.resetOrganizationSelection();

        if (!value || value.trim() === '') {
          return;
        }

        this.isEmailRegexValid(value);

        if (this.infoFormGroup.get('email').hasError('invalidEmail')) {
          return;
        }

        await this.auth.emailInUse(value)
          .then((res: any) => {
            this.emailInUse = res.identifierInUse;
            if (this.emailInUse) {
              this.fieldErrorMsg = 'This email is already in use';
              this.infoFormGroup.get('email').setErrors({
                emailInUse: true
              });
            } else {
              this.fieldErrorMsg = '';
              this.infoFormGroup.get('email').setErrors(null);
            }
          })
          .catch((err) => {
            this.errorMsg = 'Email must be an email';
            this.authValidation.showError();
          });

        if (!this.emailInUse && !this.infoFormGroup.get('email').errors) {
          this.loadOrganizationSuggestion(value);
        }

      });
  }

  /**
   * Checks an email to ensure it is valid
   *
   * @param email The email to check
   */
  private isEmailRegexValid(email: string) {
    if (email.match(EMAIL_REGEX) === null) {
      this.fieldErrorMsg = 'Invalid Email Address';
      this.infoFormGroup.get('email').setErrors({
        invalidEmail: true
      });
    } else {
      this.fieldErrorMsg = '';
    }
  }

  /**
   * Disables the InfoNext Button when any form controls inside the infoFormGroup
   * are INVALID
   */
  private toggleInfoNextButton() {
    this.infoFormGroup.statusChanges
      .pipe(
        takeUntil(this.ngUnsubscribe)
      ).subscribe((value) => {
        this.buttonGuards.isInfoPageInvalid = value === 'INVALID';
      });

  }

  /**
   * Disables the organization next button when any form controls inside the organizationFormGroup
   * are INVALID
   */
  private toggleOrganizationNextButton() {
    this.organizationFormGroup.statusChanges
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((value) => {
        this.buttonGuards.isOrganizationPageInvalid = value === 'INVALID';
      });
  }

  /**
   * Disables the accountNext Button when any form controls inside the accountFormGroup
   * are INVALID
   */
  private toggleRegisterButton() {
    this.accountFormGroup.statusChanges
      .pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((value) => {
        this.buttonGuards.isRegisterPageInvalid = value === 'INVALID';
      });
  }


  /**
   * Changes the template to the next template
   */
  nextTemp(): void {
    switch (this.currentTemp) {
      case this.TEMPLATES.info.temp:
        if (this.shouldCreateOrganization) {
          this.currentTemp = this.TEMPLATES.organization.temp;
          this.currentIndex = this.TEMPLATES.organization.index;
        } else {
          this.currentTemp = this.TEMPLATES.account.temp;
          this.currentIndex = this.TEMPLATES.account.index;
        }
        break;
      case this.TEMPLATES.organization.temp:
        this.currentTemp = this.TEMPLATES.account.temp;
        this.currentIndex = this.TEMPLATES.account.index;
        break;
      case this.TEMPLATES.account.temp:
        this.currentTemp = this.TEMPLATES.submission.temp;
        this.currentIndex = this.TEMPLATES.submission.index;
        break;
      case this.TEMPLATES.submission.temp:
        this.currentTemp = this.TEMPLATES.sso.temp;
        this.currentIndex = this.TEMPLATES.sso.index;
        break;
    }
    this.slide = !this.slide;
  }

  /**
   * Go Back to Info Template from Account Template
   */
  goBack(): void {
    this.fall = !this.fall;
    if (this.currentTemp === this.TEMPLATES.account.temp && this.shouldCreateOrganization) {
      this.currentTemp = this.TEMPLATES.organization.temp;
      this.currentIndex = this.TEMPLATES.organization.index;
    } else if (this.currentTemp === this.TEMPLATES.account.temp) {
      this.currentTemp = this.TEMPLATES.info.temp;
      this.currentIndex = this.TEMPLATES.info.index;
    } else if (this.currentTemp === this.TEMPLATES.organization.temp) {
      this.currentTemp = this.TEMPLATES.info.temp;
      this.currentIndex = this.TEMPLATES.info.index;
    }
  }

  /**
   * Checks localstorage for cookie agreement
   *
   * @returns True if the the user has agreed to cookies false otherwise
   */
  checkCookieAgreement() {
    return this.cookieAgreement.getCookieAgreementVal();
  }

  /**
   * Function called after the user has verified their captcha
   *
   * @param event Event emitted from captcha
   */
  captureResponse(event) {
    this.verified = event;
    if (!this.verified) {
      this.accountFormGroup.get('captcha').setErrors({
        notVerified: true
      });
    }
  }

  /**
   * Selects an organization from the list
   *
   * @param org The organization selected
   */
  selectOrg(org: Organization) {
    this.shouldCreateOrganization = false;
    this.createdOrganizationId = '';
    this.organizationFormGroup.reset({
      name: '',
      sector: '',
      levels: [],
      state: '',
      country: '',
    });
    this.regInfo.organization = org.name;
    this.selectedOrg = org._id;
    this.infoFormGroup.get('organization')!.setValue(org.name);
    this.closeDropdown();
  }

  /**
   * Registers typing events from the organization input
   *
   * @param event The typing event
   */
  keyup(event: any) {
    this.shouldCreateOrganization = false;
    this.createdOrganizationId = '';
    this.organizationInput$.next(event.target.value);
  }

  enterCustomOrganizationFlow(): void {
    if (!this.canEnterCustomOrganizationFlow) {
      this.infoFormGroup.get('firstname')!.markAsTouched();
      this.infoFormGroup.get('lastname')!.markAsTouched();
      this.infoFormGroup.get('email')!.markAsTouched();
      return;
    }

    this.shouldCreateOrganization = true;
    this.organizationContinueAttempted = false;
    this.createdOrganizationId = '';
    this.selectedOrg = '';
    this.organizationFormGroup.patchValue({
      name: this.regInfo.organization.trim(),
      sector: this.organizationFormGroup.get('sector')!.value || '',
      levels: this.organizationFormGroup.get('levels')!.value || [],
      state: this.organizationFormGroup.get('state')!.value || '',
      country: this.organizationFormGroup.get('country')!.value || '',
    });
    this.currentTemp = this.TEMPLATES.organization.temp;
    this.currentIndex = this.TEMPLATES.organization.index;
    this.slide = !this.slide;
  }

  continueFromOrganization(): void {
    this.organizationContinueAttempted = true;

    if (this.organizationFormGroup.invalid) {
      this.organizationFormGroup.markAllAsTouched();
      return;
    }

    this.nextTemp();
  }

  toggleOrganizationLevel(level: OrganizationLevel): void {
    const currentLevels: OrganizationLevel[] = this.organizationFormGroup.get('levels')!.value || [];
    const nextLevels = currentLevels.includes(level)
      ? currentLevels.filter(existingLevel => existingLevel !== level)
      : [...currentLevels, level];

    this.organizationFormGroup.get('levels')!.setValue(nextLevels);
    this.createdOrganizationId = '';
    this.selectedOrg = '';
  }

  isOrganizationLevelSelected(level: OrganizationLevel): boolean {
    const currentLevels: OrganizationLevel[] = this.organizationFormGroup.get('levels')!.value || [];
    return currentLevels.includes(level);
  }

  formatOptionLabel(value: string): string {
    return value
      .split('_')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  onOrganizationDetailsChanged(): void {
    this.organizationContinueAttempted = false;
    this.createdOrganizationId = '';
    this.selectedOrg = '';
  }

  isUnitedStatesSelected(): boolean {
    return this.organizationFormGroup.get('country')!.value === 'US';
  }

  private getErrorMessage(error: unknown): string | null {
    if (!error) {
      return null;
    }

    if (typeof error === 'string') {
      return this.parseErrorString(error);
    }

    if (typeof error === 'object') {
      const maybeError = error as {
        message?: string;
        error?: unknown;
        errors?: Array<{ message?: string }>;
      };

      if (typeof maybeError.message === 'string' && maybeError.message.trim() !== '') {
        return maybeError.message;
      }

      if (Array.isArray(maybeError.errors) && maybeError.errors.length > 0) {
        const firstMessage = maybeError.errors.find(item => item?.message)?.message;
        if (firstMessage) {
          return firstMessage;
        }
      }

      if (typeof maybeError.error === 'string') {
        return this.parseErrorString(maybeError.error);
      }

      if (maybeError.error && typeof maybeError.error === 'object') {
        return this.getErrorMessage(maybeError.error);
      }
    }

    return null;
  }

  private parseErrorString(error: string): string {
    try {
      const parsedError = JSON.parse(error) as { message?: string };
      return parsedError.message || error;
    } catch {
      return error;
    }
  }

  private loadOrganizationSuggestion(email: string) {
    this.latestSuggestionEmail = email.trim().toLowerCase();
    this.organizationSuggestionLoading = true;
    this.suggestedOrganization = null;

    this.orgService.suggestDomain(email.trim())
      .pipe(take(1))
      .subscribe({
        next: (response: SuggestDomainResponse) => {
          if (this.latestSuggestionEmail !== email.trim().toLowerCase()) {
            return;
          }

          this.organizationSuggestionLoading = false;
          this.suggestedOrganization = response.organization ?? null;
          if (this.suggestedOrganization) {
            this.regInfo.organization = this.suggestedOrganization.name;
            this.selectedOrg = this.suggestedOrganization._id;
            this.infoFormGroup.get('organization')!.setValue(this.suggestedOrganization.name);
          }
        },
        error: () => {
          if (this.latestSuggestionEmail !== email.trim().toLowerCase()) {
            return;
          }

          this.organizationSuggestionLoading = false;
          this.suggestedOrganization = null;
        }
      });
  }

  private resetOrganizationSelection() {
    this.latestSuggestionEmail = '';
    this.organizationSuggestionLoading = false;
    this.organizationSearchLoading = false;
    this.suggestedOrganization = null;
    this.searchResults = [];
    this.showDropdown = false;
    this.selectedOrg = '';
    this.regInfo.organization = '';
    this.infoFormGroup.get('organization')!.setValue('');
    this.shouldCreateOrganization = false;
    this.createdOrganizationId = '';
    this.organizationFormGroup.reset({
      name: '',
      sector: '',
      levels: [],
      state: '',
      country: '',
    });
  }

  private watchOrganizationCountry(): void {
    const countryControl = this.organizationFormGroup.get('country')!;
    this.syncStateControlWithCountry(countryControl.value);

    countryControl.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((countryCode: string) => {
        this.syncStateControlWithCountry(countryCode);
        this.onOrganizationDetailsChanged();
      });
  }

  private syncStateControlWithCountry(countryCode: string): void {
    const stateControl = this.organizationFormGroup.get('state')!;
    const requiresState = countryCode === 'US';

    if (requiresState) {
      stateControl.enable({ emitEvent: false });
      stateControl.setValidators(Validators.required);
    } else {
      stateControl.setValue('', { emitEvent: false });
      stateControl.clearValidators();
      stateControl.disable({ emitEvent: false });
    }

    stateControl.updateValueAndValidity();
    this.organizationFormGroup.updateValueAndValidity();
  }

  private async createCustomOrganization(): Promise<void> {
    this.organizationCreationLoading = true;

    try {
      const response = await this.orgService.createOrganization({
        name: this.organizationFormGroup.get('name')!.value.trim(),
        sector: this.organizationFormGroup.get('sector')!.value as OrganizationSector,
        levels: this.organizationFormGroup.get('levels')!.value as OrganizationLevel[],
        state: this.organizationFormGroup.get('state')!.value?.trim() || undefined,
        country: this.organizationFormGroup.get('country')!.value?.trim() || undefined,
      })
        .pipe(take(1))
        .toPromise() as CreateOrganizationResponse;

      this.createdOrganizationId = response.organization._id.toString();
      this.selectedOrg = response.organization._id.toString();
      this.orgService.clearCache();
    } finally {
      this.organizationCreationLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
