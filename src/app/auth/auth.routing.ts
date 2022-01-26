import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CanResetPasswordGuard } from './can-reset-password.guard';
import { AuthComponent } from './auth.component';
import { EmailVerifiedComponent } from './email-verified/email-verified.component';

// eslint-disable-next-line @typescript-eslint/naming-convention
const auth_routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent, data: { title: 'Login' } },
      { path: 'register', component: RegisterComponent, data: { title: 'Register' } },
      { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: 'Change Password'} },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canActivate: [CanResetPasswordGuard],
        data: { title: 'Reset-Password'}
      },
      { path: 'email-verified', component: EmailVerifiedComponent, data: { title: 'Email Verfication'} },
      // Catch All
      { path: '**', redirectTo: 'login', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(auth_routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
