// Core
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Shared 3rd Party Modules
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { CheckBoxModule } from 'clark-checkbox';
import { ClickOutsideModule } from 'ng-click-outside';
import { ParticlesModule } from 'angular-particle';
import { NotificationModule } from '../shared/notifications';
// Shared CLARK Modules
import { ModalModule } from './modals';
// Components
import { BrowseByMappingsComponent } from './browse-by-mappings/browse-by-mappings.component';
import { MessageComponent } from './navbar/message/message.component';
import { NavbarComponent } from './navbar/navbar.component';
import { EncodeUriComponentPipe } from './pipes/encoded-url.pipe';

/**
 * Contains all stateless UI modules (directives, components, pipes) that are used across the app.
 *
 * @class SharedModule
 */
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ParticlesModule,
    VirtualScrollModule,
    ClickOutsideModule,
    CheckBoxModule,
    ModalModule,
    NotificationModule
  ],
  providers: [ ],
  declarations: [
    BrowseByMappingsComponent,
    NavbarComponent,
    MessageComponent,
    EncodeUriComponentPipe
  ],
  exports: [
    BrowseByMappingsComponent,
    NavbarComponent,
    EncodeUriComponentPipe
  ]
})
export class SharedModule { }
