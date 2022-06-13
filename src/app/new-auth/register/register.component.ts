import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { AuthValidationService } from 'app/core/auth-validation.service';

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
export class RegisterComponent implements OnInit {
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

  slide: boolean;
  fall = false;

  regInfo = {
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    public authValidation: AuthValidationService,
  ) { }

  ngOnInit(): void { }

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
    console.log(this.regInfo);
    this.slide = !this.slide;
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

  validateInfoPage() {

  }

  validateAccountPage() {

  }

  captureResponse(event) {
    this.verified = event;
  }

}
