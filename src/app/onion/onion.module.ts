import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OnionRoutingModule } from './onion.routing';
import { LearningObjectBuilderModule } from './learning-object-builder/learning-object-builder.module';

import { VirtualScrollerModule } from 'ngx-virtual-scroller';

// Other
import { OnionCoreModule } from './core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ModalModule } from '../shared/modules/modals/modal.module';
import { OnionComponent } from './onion.component';
import { OnionSharedModule } from './shared/onion-shared.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RelevancyBuilderModule } from './relevancy-builder/relevancy-builder.module';

import { SidePanelContentModule } from './dashboard/components/side-panel-content/side-panel-content.module';
import { EmailBannerComponent } from './components/email-banner/email-banner.component';
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
    EmailBannerComponent
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
    LearningObjectBuilderModule,
    OnionRoutingModule,
    VirtualScrollerModule,
    DashboardModule,
    SidePanelContentModule,
    RelevancyBuilderModule
  ],
  exports: [
    VirtualScrollerModule,
  ]
})
export class OnionModule { }
