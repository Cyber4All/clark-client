import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { ParticlesModule } from 'angular-particle';
import { FormsModule } from '@angular/forms';
import { CookieModule } from 'ngx-cookie';


import { LoginComponent } from './login/login.component';

import { AuthRoutingModule } from './auth.routing';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CanResetPasswordGuard } from './can-reset-password.guard';
import { ActivatedRouteSnapshot } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AuthResolve } from './auth.resolver';


@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AuthComponent,
  ],
  imports: [
    CommonModule,
    ParticlesModule,
    AuthRoutingModule,
    FormsModule,
    HttpClientModule,
    CookieModule.forRoot()
  ],
  providers: [CanResetPasswordGuard, AuthResolve],
})

export class AuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [CanResetPasswordGuard]
    };
  }
}
