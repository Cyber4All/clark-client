import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { AuthService } from 'app/core/auth.service';
import { MatchValidator } from 'app/shared/validators/MatchValidator';

@Component({
  selector: 'clark-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1000ms')
      ])
    ])
  ]
})
export class ChangePasswordComponent implements OnInit {
  errorMessage: String;
  showError: Boolean;
  otaCode: string;
  done = false;

  passwords: UntypedFormGroup = new UntypedFormGroup({
    'password': this.authValidationService.getInputUntypedFormControl('password'),
    'confirmPassword': this.authValidationService.getInputUntypedFormControl('password')
  }, { validators: MatchValidator.mustMatch('password', 'confirmPassword')});

  constructor(private authValidationService: AuthValidationService,
              private authService: AuthService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.authValidationService.getErrorState().subscribe(err => this.showError = err);
    this.otaCode = this.activatedRoute.queryParams['_value']['otaCode'];
  }

  submit(): void {
    this.authService.resetPassword(this.passwords.get('password').value, this.otaCode)
    .subscribe(val => {
      this.done = true;
    }, error => {
      this.errorMessage = 'Something went wrong! We\'re looking into the issue. Please check back later.';
      this.authValidationService.showError();
    });
  }
}
