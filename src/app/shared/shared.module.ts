// Core
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Modules
import { ClarkRoutingModule } from '../clark.routing';

// Components
import { NavbarComponent } from './navbar/navbar.component';

// Shared 3rd Party Modules
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { NotificationModule } from '../shared/notifications';
import { CheckBoxModule } from 'clark-checkbox';
import { ParticlesModule } from 'angular-particle';
import { CookieModule } from 'ngx-cookie';
import { ClickOutsideModule } from 'ng-click-outside';
import { ModalModule } from './modals';

/**
 * Contains all stateless UI modules (directives, components, pipes) that are used across the app.
 *
 * @class SharedModule
 */
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ParticlesModule,
    VirtualScrollModule,
    ClickOutsideModule,
    CheckBoxModule,
    ModalModule,
    NotificationModule
  ],
  providers: [ ],
  declarations: [
    NavbarComponent
  ],
  exports: [
    NavbarComponent,
  ]
})
export class SharedModule { }


/*
    CommonModule,
    CheckBoxModule,
    RouterModule,
    NotificationModule,
    ModalModule.forRoot(),
    ParticlesModule,
    VirtualScrollModule,
    CookieModule.forRoot(),
    NotificationModule.forRoot(),
    CheckBoxModule,
*/
