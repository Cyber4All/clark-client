import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CanResetPasswordGuard } from './can-reset-password.guard';
import { AuthComponent } from './auth/auth.component';


const routes: Routes = [
    { path: '', component: AuthComponent, children: [
        { path: '', redirectTo: 'login', pathMatch: 'full'},
        { path: 'login', component: LoginComponent, },
        { path: 'register', component: RegisterComponent, },
        { path: 'forgot-password', component: ForgotPasswordComponent, },
        { path: 'reset-password', component: ResetPasswordComponent, canActivate: [CanResetPasswordGuard] },
        // Catch All
        { path: '**', redirectTo: 'login', pathMatch: 'full' }
    ] }
];

export const AuthRoutingModule: ModuleWithProviders = RouterModule.forChild(routes);
