import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { OnionRoutingModule } from './onion.routing';
import { OnionComponent } from './onion.component';
import { LearningObjectBuilderModule } from './learning-object-builder/learning-object-builder.module';
import { DashboardComponent } from './dashboard/dashboard.component';

// Other
import { OnionCoreModule } from './core/core.module';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { CheckBoxModule } from 'clark-checkbox';
import { ClickOutsideModule } from 'ng-click-outside';
import { NotificationModule } from '../shared/notifications';
import { ModalModule } from '../shared/modals';
import { DashboardResolver } from './dashboard/dashboard.resolver';
import { TooltipModule } from '@cyber4all/clark-tooltip';
import { LearningObjectResolve } from './learning-object-builder/learning-object.resolver';
import { DashboardLearningObjectComponent } from './dashboard/components/dashboard-learning-object/dashboard-learning-object.component';
import { DashboardLearningObjectPanelComponent } from './dashboard/components/dashboard-learning-object-panel/dashboard-learning-object-panel.component';
import { PanelOverviewComponent } from './dashboard/components/dashboard-learning-object-panel/panel-overview/panel-overview.component';
import { PanelEditChildrenComponent } from './dashboard/components/dashboard-learning-object-panel/panel-edit-children/panel-edit-children.component';

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
    DashboardLearningObjectComponent,
    DashboardLearningObjectPanelComponent,
    PanelOverviewComponent,
    PanelEditChildrenComponent
  ],
  // Specifys all modules to be imported
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    SharedModule,
    OnionRoutingModule,
    OnionCoreModule,
    LearningObjectBuilderModule.forRoot(),
    HttpClientModule,
    CheckBoxModule,
    ModalModule,
    NotificationModule,
    TooltipModule
  ],
  providers: [ DashboardResolver, LearningObjectResolve ]
})
export class OnionModule { }
