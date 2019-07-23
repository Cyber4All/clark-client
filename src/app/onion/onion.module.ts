import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OnionRoutingModule } from './onion.routing';
import { LearningObjectBuilderModule } from './learning-object-builder/learning-object-builder.module';
import { OldDashboardComponent } from './old-dashboard/old-dashboard.component';

import { VirtualScrollerModule } from 'ngx-virtual-scroller';

// Other
import { OnionCoreModule } from './core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ToasterModule } from '../shared/toaster';
import { ModalModule } from '../shared/modals';
import { OnionComponent } from './onion.component';
import { OnionSharedModule } from './shared/onion-shared.module';
import { SidePanelModule } from './old-dashboard/components/side-panel/side-panel.module';
import { LearningObjectComponent } from './old-dashboard/components/side-panel-content/learning-object/learning-object.component';
import { DashboardItemComponent } from './old-dashboard/components/dashboard-item/dashboard-item.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { SidePanelContentModule } from './old-dashboard/components/side-panel-content/side-panel-content.module';
/**
 * Defines the root module that is bootstrapped to start the application.
 * This tells Angular how to handle all of the files and dependencies in use.
 *
 * @author Sean Donnelly
 */
@NgModule({
  // Specifies the components included in this module
  declarations: [
    OnionComponent,
    OldDashboardComponent,
    LearningObjectComponent,
    DashboardItemComponent,
  ],
  // Specifies all modules to be imported
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    OnionCoreModule,
    OnionSharedModule,
    ModalModule,
    ToasterModule,
    LearningObjectBuilderModule,
    OnionRoutingModule,
    VirtualScrollerModule,
    SidePanelModule,
    DashboardModule,
    SidePanelContentModule
  ],
  exports: [
    VirtualScrollerModule,
  ]
})
export class OnionModule { }
