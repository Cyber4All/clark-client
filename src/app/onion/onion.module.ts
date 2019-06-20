import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OnionRoutingModule } from './onion.routing';
import { LearningObjectBuilderModule } from './learning-object-builder/learning-object-builder.module';
import { DashboardComponent } from './dashboard/dashboard.component';

import { VirtualScrollerModule } from 'ngx-virtual-scroller';

// Other
import { OnionCoreModule } from './core/core.module';
import { SharedModule } from '../shared/shared.module';
import { ToasterModule } from '../shared/toaster';
import { ModalModule } from '../shared/modals';
import { OnionComponent } from './onion.component';
import { ChangelogItemComponent } from './dashboard/components/changelog-item/changelog-item.component';
import { IdentificationPillComponent } from './dashboard/components/identification-pill/identification-pill.component';
import { ChangelogListComponent } from './dashboard/components/changelog-list/changelog-list.component';
import { ChangelogModalComponent } from './dashboard/components/changelog-modal/changelog-modal.component';
import { OnionSharedModule } from './shared/onion-shared.module';
import { SidePanelModule } from './dashboard/components/side-panel/side-panel.module';

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
    ChangelogItemComponent,
    IdentificationPillComponent,
    ChangelogListComponent,
    ChangelogModalComponent,
  ],
  // Specifys all modules to be imported
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
    SidePanelModule
  ],
  exports: [
    VirtualScrollerModule,
  ]
})
export class OnionModule { }
