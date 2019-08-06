import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// This module
import { CookieModule } from 'ngx-cookie';
import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from './auth.routing';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CanResetPasswordGuard } from './can-reset-password.guard';
import { AuthComponent } from './auth.component';
import { AuthResolve } from './auth.resolver';

// External Modules
import { SharedModule } from 'app/shared/shared.module';
import { RecaptchaDirective } from './register/recaptcha/recaptcha.directive';
import { PersonalInfoComponent } from './register/personal-info/personal-info.component';
import { ProfileInfoComponent } from './register/profile-info/profile-info.component';
import { GravatarInfoComponent } from './register/gravatar-info/gravatar-info.component';
import { EmailVerifiedComponent } from './email-verified/email-verified.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AuthComponent,
    RecaptchaDirective,
    PersonalInfoComponent,
    ProfileInfoComponent,
    GravatarInfoComponent,
    EmailVerifiedComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  providers: [CanResetPasswordGuard, AuthResolve]
})
export class AuthModule {}
