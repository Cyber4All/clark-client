import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisteredEmailValidator } from 'app/core/registered-email-validator';
import { MatchValidator } from 'app/shared/validators/MatchValidator';

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
  }, { validators: MatchValidator.mustMatch('email', 'confirmEmail') });

  constructor(private registeredEmailValidator: RegisteredEmailValidator) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    console.log(this.emailInput);
  }

}
