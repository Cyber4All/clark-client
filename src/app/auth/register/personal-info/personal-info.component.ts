import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { NgControl, FormGroup, FormControl, Validators, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

interface Person {
  firstname: string;
  lastname: string;
  email: string;
  organization: string;
}

@Component({
  selector: 'clark-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'], 
  providers: [
    {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => PersonalInfoComponent),
        multi: true
    }
  ]
})

export class PersonalInfoComponent implements OnInit, ControlValueAccessor {
  @Input() personalInfo: FormGroup;

  private _personinfo: Person = <Person>{};

  writeValue(value: any): void {
    this._personinfo = value;
  }

  propagateChange = (_: any) => { };

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  setDisabledState?(isDisabled: boolean): void {}
 
  /*loading: boolean = false;
  verified: boolean = true;
  personInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
  };

  registerFailure;
  registerFailureTimer;*/

  constructor() { }

  get firstname() {
    return this._personinfo.firstname;
  }
s
  set firstname(value) {
    this._personinfo.firstname = value;
    this.propagateChange(this._personinfo);
  }

  get lastname() {
    return this._personinfo.lastname;
  }

  set lastname(value) {
    this._personinfo.lastname = value;
    this.propagateChange(this._personinfo);
  }

  get email() {
    return this._personinfo.email;
  }

  set email(value) {
    this._personinfo.email = value;
    this.propagateChange(this._personinfo);
  }

  get organization() {
    return this._personinfo.organization;
  }

  set organization(value) {
    this._personinfo.organization = value;
    this.propagateChange(this._personinfo);
  } 

  ngOnInit() {}

  /*submit() {
    this.registerFailure = undefined;
    clearTimeout(this.registerFailureTimer);
    this.loading = false;

    if (!this.validate()) {
      return false;
    } else {
      return true; 
    }
  }

  validate(): boolean {
    let m: boolean[] = Object.values(this.personInfo).map(function(l) {
      return (l && l !== '' && true) || false;
    });
    let email =
      this.personInfo.email.match(
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g
      ) !== null;

    if (m.includes(false) && this.verified === true) {
      this.error('Please fill in all fields!');
      this.loading = false;
      return false;
    } else if (!email) {
      this.error('Please enter a valid email!');
      this.loading = false;
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
  }*/
}
