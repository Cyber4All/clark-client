import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { EmailVerifiedComponent } from './email-verified/email-verified.component';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from './auth.routing';
import { InputFieldComponent } from './components/input-field/input-field.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorBannerComponent } from './components/error-banner/error-banner.component';
import { RecaptchaDirective } from './register/components/recaptcha/recaptcha.directive';
import { RegistrationProgressComponent } from './register/components/registration-progress/registration-progress.component';

@NgModule({
  declarations: [
    AuthComponent,
    RegisterComponent,
    LoginComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    EmailVerifiedComponent,
    InputFieldComponent,
    ErrorBannerComponent,
    RecaptchaDirective,
    RegistrationProgressComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    RouterModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
