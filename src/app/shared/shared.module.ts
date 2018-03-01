// Core
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Modules
import { ClarkRoutingModule } from '../clark.routing';

// Components
import { NavbarComponent } from './navbar/navbar.component';

// Shared 3rd Party Modules
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { ModalModule } from '@cyber4all/clark-modal';
import { NotificationModule } from 'clark-notification';
import { CheckBoxModule } from 'clark-checkbox';
import { ParticlesModule } from 'angular-particle';

/**
 * Contains all stateless UI modules (directives, components, pipes) that are used across the app.
 *
 * @class SharedModule
 */
@NgModule({
  imports: [
    CommonModule,
    CheckBoxModule,
    RouterModule,
    NotificationModule,
    ModalModule,
    ParticlesModule,
    VirtualScrollModule
  ],
  declarations: [
    NavbarComponent
  ],
  exports: [
    NavbarComponent
  ]
})
export class SharedModule { }
