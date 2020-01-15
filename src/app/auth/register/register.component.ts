import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  trigger,
  style,
  transition,
  animate,
  keyframes,
  query,
  stagger
} from '@angular/animations';
import { environment } from '@env/environment';
import { BehaviorSubject } from 'rxjs';

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
  regInfo = {
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    organization: '',
    password: ''
  };
  regForm = new FormGroup({
    firstname: new FormControl(null, Validators.required),
    lastname: new FormControl(null, Validators.required),
    username: new FormControl(null, Validators.required),
    email: new FormControl(null, Validators.required),
    organization: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
    verifypassword: new FormControl(null, Validators.required),
    captcha: new FormControl()
  });

  siteKey = '6LfS5kwUAAAAAIN69dqY5eHzFlWsK40jiTV4ULCV';

  passwordVerify = '';
  registerFailure;
  registerFailureTimer;
  redirectUrl;
  page = 1;
  fall: boolean;
  slide: boolean;
  loading = false;
  verified = false;
  isValidPage: boolean;
  inUseEmail = false;
  inUseUsername = false;

  tipText = [
    {
      left: 'Tell us about yourself',
      right: 'Create your profile'
    },
    {
      left: 'Tell us about yourself',
      right: 'Preview your profile'
    },
    {
      left: 'Create your profile',
      right: 'Register!'
    }
  ];

  elements = ['Personal Information', 'User Information', 'Preview'];

  // components for carousel component functionality
  activeIndex = 0;
  action$: BehaviorSubject<number> = new BehaviorSubject(this.activeIndex);

  @HostListener('window:keyup', ['$event'])
  keyup(event) {
    if (event.target.tagName.toLowerCase() !== 'input') {
      if (event.keyCode === 39) {
        this.next();
      } else if (event.keyCode === 37) {
        this.back();
      }
    }
  }

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.parent.data.subscribe(() => {
      if (route.snapshot.queryParams.redirectUrl) {
        this.redirectUrl = decodeURIComponent(
          route.snapshot.queryParams.redirectUrl
        );
      }
    });
  }

  ngOnInit() {
    // If development/testing set verified to true in order to skip reCaptcha check in e2e tests
    if (environment.production === false) {
      this.verified = true;
    }
  }

  submit() {
    this.updateObjValues();
    this.registerFailure = undefined;
    clearTimeout(this.registerFailureTimer);
    this.loading = true;

    if (!this.validate()) {
      return false;
    }

    const u = {
      username: this.regInfo.username,
      name: `${this.regInfo.firstname.trim()} ${this.regInfo.lastname.trim()}`,
      email: this.regInfo.email.trim(),
      organization: this.regInfo.organization.trim(),
      password: this.regInfo.password
    };

    this.auth.register(u).then(
      () => {
        if (this.redirectUrl) {
          this.router.navigate([this.redirectUrl]);
        } else {
          this.router.navigate(['home']);
        }
      },
      error => {
        this.error(error.error || error.message || error);
      }
    );
  }

  validate(): boolean {
    const m: boolean[] = Object.values(this.regInfo).map(function(l) {
      return (l && l !== '' && true) || false;
    });
    if (m.includes(false) && this.verified === true) {
      this.error('Please fill in all fields!');
      this.loading = false;
      return false;
    } else if (this.verified === false) {
      this.error('Please complete captcha!');
      this.loading = false;
      return false;
    } else if (!this.getvalidEmail()) {
      this.error('Please enter a valid email!');
      this.loading = false;
      return false;
    } else if (this.inUseEmail) {
      this.error('This email is already taken');
      return false;
    }
    return true;
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.registerFailure = text;
    this.loading = false;
    this.registerFailureTimer = setTimeout(() => {
      this.registerFailure = undefined;
    }, duration);
  }

  captureResponse(event) {
    this.verified = event;
  }

  // navigation
  next() {
    this.pageValidate(); // Validate page before allowing access to the next
    if (this.page === 1 && this.isValidPage) {
      this.slidePage();
    } else {
      this.slidePage();
    }
  }

  private slidePage() {
    if (this.isValidPage) {
      this.slide = !this.slide;
    }
    if (this.page === 1 && this.isValidPage) {
      this.action$.next(2);
    } else if (this.page === 2 && this.isValidPage) {
      this.action$.next(3);
    }
  }

  // navigation
  back() {
    this.fall = !this.fall;
    if (this.page === 2) {
      this.action$.next(1);
    } else if (this.page === 3) {
      this.action$.next(2)
    }
    this.activeIndex--;
  }

  // Checks for specific items on pages 1 and 2
  pageValidate() {
    switch (this.page) {
      case 1:
        this.isValidPage = this.validatePageOne();
        break;
      case 2:
        this.isValidPage = this.validatePageTwo();
        break;
    }
  }

  /**
   * Validates the form on page one
   * @return true if form on page one is valid, false otherwise
   */
  validatePageOne(): boolean {
    if (
      this.regForm.controls['firstname'].value === null ||
      this.regForm.controls['lastname'].value === null ||
      this.regForm.controls['email'].value === null ||
      this.regForm.controls['organization'].value === null
    ) {
      this.error('Please fill in all fields!');
      return false;
    } else if (!this.getvalidEmail()) {
      this.error('Please enter a valid email!');
      return false;
    } else if (this.inUseEmail) {
      this.error('This email is already taken');
      return false;
    }

    return true;
  }

  /**
   * Validates the form on page two
   * @return true if form on page two is valid, false otherwise
   */
  validatePageTwo(): boolean {
    if (
      this.regForm.controls['password'].value !==
      this.regForm.controls['verifypassword'].value
    ) {
      this.error('Passwords do not match!');
      return false;
    } else if (
      this.regForm.controls['username'].value === null ||
      this.regForm.controls['password'].value === null ||
      this.regForm.controls['verifypassword'].value === null
    ) {
      this.error('Please fill in all fields!');
      return false;
    } else if (this.inUseUsername) {
      this.error('This username is already taken');
      return false;
    } else if (
      this.regForm.controls['username'].value.length < 3 ||
      this.regForm.controls['username'].value.length > 20
    ) {
      this.error(
        'Usernames must be at least 3 characters long and no longer than 20 characters.'
      );
      return false;
    }

    return true;
  }

  navigate(index: number) {
    if (index > this.page - 1) {
      for (let i = this.page - 1; i < index; i++) {
        this.next();
      }
    } else if (index < this.page - 1) {
      for (let i = index; i <= this.page - 1; i++) {
        this.back();
      }
    }
  }

  // Places FormControl values in regInfo object
  // RegInfo object is used for final form validation
  updateObjValues() {
    this.regInfo.firstname = this.regForm.controls['firstname'].value;
    this.regInfo.lastname = this.regForm.controls['lastname'].value;
    this.regInfo.email = this.regForm.controls['email'].value;
    this.regInfo.organization = this.regForm.controls['organization'].value;
    this.regInfo.username = this.regForm.controls['username'].value;
    this.regInfo.password = this.regForm.controls['password'].value;
    this.passwordVerify = this.regForm.controls['verifypassword'].value;
  }

  getvalidEmail() {
    const email =
      this.regForm.controls['email'].value.toLowerCase().match(
        // tslint:disable-next-line:max-line-length
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g
      ) !== null;
    return email;
  }

  setInUseEmail(inUse: boolean) {
    this.inUseEmail = inUse;
  }

  setInUseUsername(inUse: boolean) {
    this.inUseUsername = inUse;
  }
}
