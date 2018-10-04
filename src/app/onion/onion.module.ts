import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OnionRoutingModule } from './onion.routing';
import { OnionComponent } from './onion.component';
import { LearningObjectBuilderModule } from './learning-object-builder/learning-object-builder.module';
import { DashboardComponent } from './dashboard/dashboard.component';

// Other
import { OnionCoreModule } from './core/core.module';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { ToasterModule } from '../shared/toaster';
import { ModalModule } from '../shared/modals';
import { LearningObjectResolve } from './learning-object-builder/learning-object.resolver';
import { DashboardItemComponent } from './dashboard/dashboard-item/dashboard-item.component'

/**
 * Defines the root module that is bootstrapped to start the application.
 * This tells Angular how to handle all of the files and dependencies in use.
 *
 * @author Sean Donnelly
 */
@NgModule({
  // Specifys the components included in this module
  declarations: [
    OnionComponent,
    DashboardComponent,
    DashboardItemComponent
  ],
  // Specifys all modules to be imported
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OnionRoutingModule,
    OnionCoreModule,
    LearningObjectBuilderModule.forRoot(),
    HttpClientModule,
    ModalModule,
    ToasterModule,
  ],
  providers: [ LearningObjectResolve ]
})
export class OnionModule { }
