import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ControlValueAccessor } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '@cyber4all/clark-entity';
import * as md5 from 'md5';
import { trigger,style,transition,animate,keyframes,query,stagger } from '@angular/animations';
import { PersonalInfoComponent} from '../register/personal-info/personal-info.component';

@Component({
  selector: 'clark-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'], 
  animations: [
    trigger(
      'slideInRight',
      [
        transition(
          '* => *', [
            style({transform: 'translateX(100%)', opacity: 0}),
            animate('400ms', style({transform: 'translateX(0)', opacity: 1}))
          ]
        ),
        transition(
          '* => *', [
            style({transform: 'translateX(0)', 'opacity': 1}),
            animate('400ms', style({transform: 'translateX(-100%)', opacity: 0}))
          ]
        )
      ]
    ), 

    trigger(
      'fallFromTop', 
      [
        transition(
          '* => *', [
            query(':enter', style({ opacity: 0 }), { optional: true }), 

            query(':enter', stagger('300ms', [
              animate('.6s ease-in', keyframes([
              style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
              style({opacity: .5, transform: 'translateY(35px)',  offset: 0.3}),
              style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
            ]))]), {optional: true})
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
  redirectRoute;
  redirectUrl;
  page: number = 1; 
  fall: boolean;
  slide: boolean;
  loading: boolean = false;
  verified: boolean = false;
  check: boolean; 
  inUseEmail: boolean= false; 
  inUseUsername: boolean=false; 

  constructor(private auth: AuthService, private route: ActivatedRoute, private fb: FormBuilder) {

    this.route.parent.data.subscribe(data => {
      if (route.snapshot.queryParams.returnUrl) {
        this.redirectUrl = this.auth.makeRedirectURL(
          route.snapshot.queryParams.returnUrl
        );
      } else {
        if (route.snapshot.queryParams.redirectRoute) {
          this.redirectRoute = route.snapshot.queryParams.redirectRoute;
        } else {
          this.redirectRoute = data.redirect;
        }
      }
    });
  }

  ngOnInit() {}

  submit() {
    this.updateObjValues(); 
    this.registerFailure = undefined;
    clearTimeout(this.registerFailureTimer);
    this.loading = true;

    if (!this.validate()) {
      return false;
    }

    let u = new User(
      this.regInfo.username,
      `${this.regInfo.firstname.trim()} ${this.regInfo.lastname.trim()}`,
      this.regInfo.email.trim(),
      this.regInfo.organization.trim(),
      this.regInfo.password
    );

    this.auth.register(u).subscribe(
      val => {
        if (this.redirectRoute) {
          window.location.href = window.location.origin + this.redirectRoute;
        } else {
          window.location.href = this.redirectUrl;
        }
      },
      error => {
        this.error(error.error.message);
      }
    );
  }

  validate(): boolean {
    let m: boolean[] = Object.values(this.regInfo).map(function(l) {
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

  captureResponse(event)  {
    this.verified = event;
  }

  // navigation 
  next() {
    this.pageValidate(); // Validate page before allowing access to the next
    if(this.check) {
      this.slide = !this.slide; 
    }
    if (this.page == 1 && this.check) {
      this.page = 2;
    } else if (this.page == 2 && this.check) {
      this.page = 3; 
    }
  }

  // navigation 
  back() {
    this.fall = !this.fall; 
    if (this.page == 2) {
      this.page = 1;  
    } else if (this.page == 3) {
      this.page = 2;
    }
  }

  // Checks for specific items on pages 1 and 2
  pageValidate() { 
    switch(this.page) { 
      case 1:
        if (this.regForm.controls['firstname'].value === null || this.regForm.controls['lastname'].value === null ||
              this.regForm.controls['email'].value === null || this.regForm.controls['organization'].value === null ) { 
          this.error('Please fill in all fields!');
          this.check = false;
        } else if (!this.getvalidEmail()) {
            this.error('Please enter a valid email!');
            this.check = false; 
        } else if (this.inUseEmail) {
            this.error('This email is already taken');
            this.check = false; 
        } else {
            this.check = true; 
        }
        break; 
      case 2: 
        if (this.regForm.controls['password'].value !== this.regForm.controls['verifypassword'].value) {
            this.error('Passwords do not match!');
            this.check = false;
        } else if (this.regForm.controls['username'].value === null || this.regForm.controls['password'].value === null ||
            this.regForm.controls['verifypassword'].value === null) { 
            this.error('Please fill in all fields!');
            this.check = false; 
        } else if (this.inUseUsername) {
          this.error('This username is already taken');
          this.check = false; 
        } else {
            this.check = true; 
        }
        break; 
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
    let email = this.regForm.controls['email'].value.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g
      ) !== null;
    return email; 
  }

  setInUseEmail(inUse : boolean) { 
    this.inUseEmail = inUse; 
  }

  setInUseUsername(inUse : boolean) { 
    this.inUseUsername = inUse; 
  }
}
