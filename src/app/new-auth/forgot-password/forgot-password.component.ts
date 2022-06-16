import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisteredEmailValidator } from 'app/core/registered-email-validator';

@Component({
  selector: 'clark-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit {

  @ViewChild('email') emailInput;

  emails = new FormGroup({
    'email': new FormControl('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [this.registeredEmailValidator.validate.bind(this.registeredEmailValidator)],
      updateOn: 'blur'
    }),
    'confirmEmail': new FormControl('', {
      validators: [Validators.required, Validators.email],
      updateOn:'blur'
    })
  }, {});

  constructor(private registeredEmailValidator: RegisteredEmailValidator) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    console.log(this.emailInput);
  }

}
