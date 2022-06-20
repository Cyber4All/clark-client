import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { AuthService } from 'app/core/auth.service';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    confirmPassword: ''
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

  emailInUse: boolean = false;
  usernameInUse: boolean = false;
  
  constructor(
    public authValidation: AuthValidationService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.authValidation.getErrorState().subscribe(err => this.registrationFailure = err);
    this.toggleInfoNextButton();
    this.toggleRegisterButton();
    this.validateEmail();
  }

  private validateEmail() {
    this.infoFormGroup.get('email').valueChanges.subscribe((value) => {
      this.auth.emailInUse(value)
      .then((res: any) => {
        this.emailInUse = res.inUse;
        if (this.emailInUse) { // Email in use
          this.infoFormGroup.setErrors({
            inUse: true
          });
          this.fieldErrorMsg = "This email is already in use";
        } else {
          // Email not in use
        }
      })
    })
  } 

  private infoFieldIsValid(): boolean{
    return (this.infoFormGroup.get('firstname').errors === null &&
    this.infoFormGroup.get('lastname').errors === null &&
    this.infoFormGroup.get('email').errors === null &&
    this.infoFormGroup.get('organization').errors === null);
  }

  private toggleInfoNextButton() {
    this.infoFormGroup.valueChanges
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe((value) => {
      this.buttonGuards.isInfoPageInvalid =
        value.firstname === '' || value.lastname === '' || value.organization === '' ||
        value.email === '' || !this.infoFieldIsValid();
    });
  }

  private toggleRegisterButton() {
    this.accountFormGroup.valueChanges
    .pipe(
      takeUntil(this.ngUnsubscribe)
    )
    .subscribe((value) => {
      this.buttonGuards.isRegisterPageInvalid =
        value.username === '' || value.password === '' || value.confirmPassword === '' ||
        !this.accountFieldIsValid() || !this.isCaptchaValid();
    });
  }

  private accountFieldIsValid() {
    return this.accountFormGroup.get('password').errors === null &&
      this.accountFormGroup.get('username').errors === null &&
      this.accountFormGroup.get('confirmPassword').errors === null;
  }

  private isCaptchaValid() {
    if (!this.verified) {
      this.accountFormGroup.get('captcha').setErrors({
        notVerified: true
      });
      return false;
    }
    return true;
  }

  /**
   * TO-DO: implement this method
   *
   * @param f form data
   */
  public submit(): void {
    this.nextTemp();
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
    if (this.verified && this.accountFieldIsValid()) {
      this.buttonGuards.isRegisterPageInvalid = false;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
