import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthValidationService } from 'app/core/auth-module/auth-validation.service';
import { AuthService } from 'app/core/auth-module/auth.service';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
import { Organization } from 'entity/organization';
import { OrganizationService } from 'app/core/utility-module/organization.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, debounce, debounceTime } from 'rxjs/operators';
import { CookieAgreementService } from 'app/core/auth-module/cookie-agreement.service';
import { UserService } from 'app/core/user-module/user.service';
import { AUTH_ROUTES } from 'app/core/auth-module/auth.routes';

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
  ssoRedirect = AUTH_ROUTES.GOOGLE_SIGNUP();

  TEMPLATES = {
    info: { temp: 'info', index: 1 },
    account: { temp: 'account', index: 2 },
    submission: { temp: 'submission', index: 3 },
    sso: { temp: 'sso', index: 3 }
  };

  currentTemp: String = 'info';
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
    isRegisterPageInvalid: true
  };

  infoFormGroup: UntypedFormGroup = new UntypedFormGroup({
    firstname: this.authValidation.getInputFormControl('required'),
    lastname: this.authValidation.getInputFormControl('required'),
    email: this.authValidation.getInputFormControl('email'),
    organization: this.authValidation.getInputFormControl('required'),
  });
  accountFormGroup: UntypedFormGroup = new UntypedFormGroup({
    username: this.authValidation.getInputFormControl('username'),
    password: this.authValidation.getInputFormControl('password'),
    confirmPassword: this.authValidation.getInputFormControl('required'),
    captcha: new UntypedFormControl()
  }, MatchValidator.mustMatch('password', 'confirmPassword'));

  emailInUse = false;
  usernameInUse = false;
  loading = false;

  organizationInput$: Subject<string> = new Subject<string>();
  showDropdown = false;
  closeDropdown = () => {
    this.showDropdown = false;
  };
  searchResults: Array<Organization> = [];
  selectedOrg = '';
  scrollerHeight = '100px';

  constructor(
    public authValidation: AuthValidationService,
    private auth: AuthService,
    private userService: UserService,
    private router: Router,
    private orgService: OrganizationService,
    private cookieAgreement: CookieAgreementService,
    private route: ActivatedRoute,
  ) {
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
    this.toggleRegisterButton();
    this.validateEmail();
    this.validateUsername();
    this.organizationInput$.pipe(debounceTime(650))
      .subscribe(async (value: string) => {
        this.searchResults = (await this.orgService.searchOrgs(value.trim()));
        this.loading = false;
      });
    this.organizationInput$
      .subscribe((value: string) => {
        if (value && value !== '') {
          this.showDropdown = true;
          this.loading = true;
        } else {
          this.showDropdown = false;
        }
      });
  }

  /**
   * Register a user
   */
  public submit(): void {
    this.auth.register({
      username: this.regInfo.username.trim(),
      firstname: this.regInfo.firstname.trim(),
      lastname: this.regInfo.lastname.trim(),
      email: this.regInfo.email.trim(),
      organization: this.regInfo.organization.trim(),
      password: this.regInfo.password
    })
      .then(() => {
        this.nextTemp();
      },
        error => {
          if (error.message !== 'Internal Server Error') {
            this.errorMsg = error.message;
          }
          this.authValidation.showError();
        });
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
          this.loading = true;
          return interval(600);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(async (value) => {
        this.loading = false;
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
          this.loading = true;
          return interval(600);
        }),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(async (value) => {
        this.loading = false;
        this.isEmailRegexValid(value);

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
            }
          })
          .catch((err) => {
            this.authValidation.showError();
          });

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
    if (this.currentTemp === this.TEMPLATES.account.temp) {
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
  selectOrg(org?: Organization) {
    if (org) {
      this.regInfo.organization = org.name;
      this.selectedOrg = org._id;
      this.infoFormGroup.get('organization')!.setValue(org.name);
    } else {
      this.regInfo.organization = 'Other';
      this.selectedOrg = '602ae2a038e2aaa1059f3c39';
      this.infoFormGroup.get('organization')!.setValue('Other');
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
