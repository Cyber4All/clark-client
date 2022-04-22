import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { NewCanResetPasswordGuard } from './new-can-reset-password.guard';
import { NewAuthComponent } from './new-auth.component';
import { EmailVerifiedComponent } from './email-verified/email-verified.component';

const authRoutes: Routes = [
  {
    path: '',
    component: NewAuthComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent, data: { title: 'Login' } },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Register' },
      },
      { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: 'Change Password'} },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        canActivate: [NewCanResetPasswordGuard],
        data: { title: 'Reset-Password'}
      },
      { path: 'email-verified', component: EmailVerifiedComponent, data: { title: 'Email Verfication'} },
      // Catch All
      { path: '**', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class NewAuthRoutingModule {}
