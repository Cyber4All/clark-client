import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AuthComponent } from './auth.component';
import { EmailVerifiedComponent } from './email-verified/email-verified.component';
import { CanChangePasswordGuard } from './can-change-password.guard';

const AuthRoutes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
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
        data: { title: 'Reset-Password'},
        canActivate: [CanChangePasswordGuard]
      },
      { path: 'email-verified', component: EmailVerifiedComponent, data: { title: 'Email Verfication'} },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      // Catch All
      { path: '**', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(AuthRoutes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
