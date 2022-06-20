import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { AuthService } from 'app/core/auth.service';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, debounceTime, debounce } from 'rxjs/operators';

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
export class RegisterComponent implements OnInit, OnDestroy{
  private ngUnsubscribe = new Subject<void>();

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
  siteKey = '6LfS5kwUAAAAAIN69dqY5eHzFlWsK40jiTV4ULCV';
  errorMsg = 'There was an issue on our end with your registration, we are sorry for the inconvience.\n Please try again later!';
  fieldErrorMsg = '';

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

  infoFormGroup: FormGroup = new FormGroup({
    firstname: this.authValidation.getInputFormControl('required'),
    lastname: this.authValidation.getInputFormControl('required'),
    email: this.authValidation.getInputFormControl('email'),
    organization: this.authValidation.getInputFormControl('required'),
  });
  accountFormGroup: FormGroup = new FormGroup({
    username: this.authValidation.getInputFormControl('username'),
    password: this.authValidation.getInputFormControl('password'),
    confirmPassword: this.authValidation.getInputFormControl('required'),
    captcha: new FormControl()
  }, MatchValidator.mustMatch('password', 'confirmPassword'));

  redirectUrl = '';

  emailInUse = false;
  usernameInUse = false;
  loading = false;

  constructor(
    public authValidation: AuthValidationService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authValidation.getErrorState().subscribe(err => this.registrationFailure = err);
    this.toggleInfoNextButton();
    this.toggleRegisterButton();
    this.validateEmail();
    this.validateUsername();
  }

  validateUsername() {
    this.accountFormGroup.get('username').valueChanges
    .pipe(
      debounce(() => {
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

  validateEmail() {
    this.infoFormGroup.get('email').valueChanges
    .pipe(
      debounce(() => {
        this.loading = true;
        return interval(600);
      }),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(async (value) => {
      console.log('Setting loading to false');
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
        }
      })
      .catch((err) => {
        this.authValidation.showError();
      });

    });
  }

  private isEmailRegexValid(email: string) {
    if (email.match(EMAIL_REGEX) === null) {
      this.fieldErrorMsg = 'Invalid Email Address';
      this.infoFormGroup.get('email').setErrors({
        invalidEmail: true
      });
    }
  }

  private toggleInfoNextButton() {
    this.infoFormGroup.statusChanges
    .pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe((value) => {
      this.buttonGuards.isInfoPageInvalid = value === 'INVALID';
    });

  }

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
   * TO-DO: implement this method
   *
   * @param f form data
   */
  public submit(): void {
    const newUser = {
      username: this.regInfo.username.trim(),
      name: `${this.regInfo.firstname.trim()} ${this.regInfo.lastname.trim()}`,
      email: this.regInfo.email.trim(),
      organization: this.regInfo.organization.trim(),
      password: this.regInfo.password
    };

    this.auth.register(newUser)
    .then(() => {
      this.nextTemp();
    },
    error => {
      this.errorMsg = error.error || error.message || error;
      this.authValidation.showError();
    });
  }

  skipSSO() {
    this.router.navigate(['home']);
  }

  /**
   *
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
   *
   */
  goBack(): void {
    this.fall = !this.fall;
    if(this.currentTemp === this.TEMPLATES.account.temp) {
      this.currentTemp = this.TEMPLATES.info.temp;
      this.currentIndex = this.TEMPLATES.info.index;
    }
  }

  captureResponse(event) {
    this.verified = event;
    if (!this.verified) {
      this.accountFormGroup.get('captcha').setErrors({
        notVerified: true
      });
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
