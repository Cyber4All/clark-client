import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewAuthComponent } from './new-auth.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { EmailVerifiedComponent } from './email-verified/email-verified.component';
import { Routes, RouterModule } from '@angular/router';
import { NewAuthRoutingModule } from './new-auth.routing';
import { InputFieldComponent } from './components/input-field/input-field.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    NewAuthComponent,
    RegisterComponent,
    LoginComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    EmailVerifiedComponent,
    InputFieldComponent
  ],
  imports: [
    CommonModule,
    NewAuthRoutingModule,
    RouterModule,
    MatInputModule,
    FormsModule
  ]
})
export class NewAuthModule { }
