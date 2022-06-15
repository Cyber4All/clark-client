import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';
import { AfterViewChecked, AfterViewInit, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
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
export class RegisterComponent implements OnInit, AfterViewInit, AfterViewChecked{
  TEMPLATES = {
    info: { temp: 'info', index: 1 },
    account: { temp: 'account', index: 2 },
    submission: { temp: 'submission', index: 3 },
    sso: { temp: 'sso', index: 3 }
  };

  captcha: FormControl = new FormControl();
  currentTemp: String = 'info';
  currentIndex = 1;

  loginFailure = false;
  verified = false;
  siteKey = '6LfS5kwUAAAAAIN69dqY5eHzFlWsK40jiTV4ULCV';
  errorMsg = 'There was an issue on our end with your registration, we are sorry for the inconvience.\n Please try again later!';

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

  @ViewChild('firstname') firstnameChild;
  @ViewChild('lastname') lastnameChild;
  @ViewChild('email') emailChild;
  @ViewChild('organization') organizationChild;
  @ViewChild('username') usernameChild;
  @ViewChild('password') passwordChild;
  @ViewChild('confirmPassword') confirmPasswordChild;

  infoFormGroup: FormGroup;
  accountFormGroup: FormGroup;

  constructor(
    public authValidation: AuthValidationService,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    if(this.currentIndex !== this.TEMPLATES.account.index) {
      return;
    }
    this.accountFormGroup = new FormGroup({
      username: this.usernameChild.control as FormControl,
      password: this.passwordChild.control as FormControl,
      confirmPassword: this.confirmPasswordChild.control as FormControl
    }, MatchValidator.mustMatch('password', 'confirmPassword'));
    this.toggleRegisterButton();
  }
  ngAfterViewInit(): void {
    this.infoFormGroup = new FormGroup({
      firstname: this.firstnameChild.control as FormControl,
      lastname: this.lastnameChild.control as FormControl,
      email: this.emailChild.control as FormControl,
      organization: this.organizationChild.control as FormControl,
    });

    this.toggleInfoNextButton();
  }

  private toggleInfoNextButton() {
    this.infoFormGroup.valueChanges.subscribe((value) => {
      // this.buttonGuards.isInfoPageInvalid = value.firstname === "" ||
      //                                       value.lastname === "" ||
      //                                       value.organization === "" ||
      //                                       value.email === "" ||
      //                                       !this.infoFieldIsValid();
      this.buttonGuards.isInfoPageInvalid = false;
    });
  }

  private toggleRegisterButton() {
    this.accountFormGroup.valueChanges.subscribe((value) => {
      this.buttonGuards.isRegisterPageInvalid = value.username === '' ||
                                                value.password === '' ||
                                                value.confirmPassword === '' ||
                                                !this.accountFieldIsValid();
    });
  }

  private accountFieldIsValid() {
    this.validatePasswords();
    if (
      this.accountFormGroup.get('password') === null &&
      this.accountFormGroup.get('username') === null &&
      this.accountFormGroup.get('confirmPassword') === null
    ) {
      return true;
    }
    return false;
  }

  private validatePasswords() {

  }

  /**
   * TO-DO: implement this method
   *
   * @param f form data
   */
  public submit(form: NgForm): void {
    console.log(form.value);
  }

  /**
   *
   */
  nextTemp(): void {
    switch (this.currentTemp) {
      case this.TEMPLATES.info.temp:
        if (!this.validateInfoPage()) {
          return;
        }
        this.currentTemp = this.TEMPLATES.account.temp;
        this.currentIndex = this.TEMPLATES.account.index;
        // Init FormControl
        // this.accountFormGroup = new FormGroup({
        //   username: this.usernameChild.control as FormControl
        // })
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
      console.log(this.infoFormGroup);
      this.toggleInfoNextButton();
    }
  }

  /**
   *  Fields in info page:
   *  First name, last name, email and organization
   */
  validateInfoPage() {
    if(this.infoFieldIsValid()) {
      return true;
    }
    return true;
  }

  /**
   *
   */
  validateAccountPage() {
    console.log('Hellp');
  }

  captureResponse(event) {
    this.verified = event;
  }

  private infoFieldIsValid(): boolean{
    return (this.infoFormGroup.get('firstname').errors === null &&
    this.infoFormGroup.get('lastname').errors === null &&
    this.infoFormGroup.get('email').errors === null &&
    this.infoFormGroup.get('organization').errors === null);
  }
}
