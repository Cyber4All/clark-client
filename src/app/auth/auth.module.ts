import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ParticlesModule } from 'angular-particle';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRouteSnapshot } from '@angular/router';

// This module
import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from './auth.routing';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CanResetPasswordGuard } from './can-reset-password.guard';
import { AuthComponent } from './auth.component';
import { AuthResolve } from './auth.resolver';

// External Modules
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';

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
    CoreModule.forRoot()
  ],
  providers: [CanResetPasswordGuard, AuthResolve],
})
export class AuthModule { }
