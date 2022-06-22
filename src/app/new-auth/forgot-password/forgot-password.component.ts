import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RegisteredEmailValidator } from 'app/shared/validators/RegisteredEmailValidator';
import { MatchValidator } from 'app/shared/validators/MatchValidator';
import { AuthValidationService } from 'app/core/auth-validation.service';
import { AuthService } from 'app/core/auth.service';
import { debounce, takeUntil } from 'rxjs/operators';
import { Subject, interval } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'clark-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  animations: [
    trigger('toggleButton', [
      state('disabled', style({
          borderColor: 'grey',
          backgroundColor: 'grey',
          color: 'black',
          opacity: 0.2
      })),
      state('enabled', style({
          borderColor: '$light-blue',
          backgroundColor: '$light-blue',
          color: 'white',
          opacity: 1
      })),
      transition('disabled <=> enabled', [
        animate('0.2s')
      ])
    ])
  ]
})
export class ForgotPasswordComponent implements OnInit{


  showError: Boolean = false;
  errorMessage: String;
  showDone: Boolean = false;
  submitButton: String = 'disabled';
  emails: FormGroup = new FormGroup({
    'email': this.authValidationService.getInputFormControl('email'),
    'confirmEmail': this.authValidationService.getInputFormControl('email')
  }, { validators: MatchValidator.mustMatch('email', 'confirmEmail') });;

  emailInUse = true;
  emailErrorMsg = '';
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private authValidationService: AuthValidationService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authValidationService.getErrorState().subscribe(err => this.showError = err);
    this.validateEmail();
  }

  // Disables button if there are any input errors, enables them otherwise
  toggleButton(): void {
    if(this.emails.controls.email.errors || this.emails.controls.confirmEmail.errors) {
      this.submitButton = 'disabled';
    } else {
      this.submitButton = 'enabled';
    }
  }

  submit(): void {
    if(this.submitButton === 'enabled') {
      this.authService.initiateResetPassword(this.emails.get('email').value).subscribe(val => {
        this.showDone = true;
      }, error => {
        this.errorMessage = error.message;
        this.authValidationService.showError();
      });
    }
  }

  private validateEmail() {
      this.emails.get('email').valueChanges.pipe(
        debounce(() => {
          // this.loading = true;
          return interval(600);
        }),
        takeUntil(this.ngUnsubscribe)).subscribe(
          async (value) => {
            await this.authService.emailInUse(value)
            .then((res: any) => {
              this.emailInUse = res.identifierInUse;
              if(!this.emailInUse && this.emails.get('email').hasError('invalidEmail')) {
                this.emailErrorMsg = 'This email is not registered!';
                this.emails.get('email').setErrors({ emailInUse: false });
              }
            })
            .catch((err) => {
              this.authValidationService.showError();
            });
      });
  }

  switch(): void {
    this.showDone = !this.showDone;
  }
}
