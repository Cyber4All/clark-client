import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewAuthComponent } from './new-auth/new-auth.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { EmailVerifiedComponent } from './email-verified/email-verified.component';



@NgModule({
  declarations: [
    NewAuthComponent,
    RegisterComponent,
    LoginComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    EmailVerifiedComponent
  ],
  imports: [
    CommonModule
  ]
})
export class NewAuthModule { }
