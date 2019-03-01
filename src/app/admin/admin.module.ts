import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LearningObjectsComponent } from './pages/learning-objects/learning-objects.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { UsersComponent } from './pages/users/users.component';
import { ContentWrapperComponent } from './components/content-wrapper/content-wrapper.component';
import { FilterSearchComponent } from 'app/admin/components/filter-search/filter-search.component';
import { FormsModule } from '@angular/forms';
import { FilterSearchService } from 'app/shared/filter-search.service';
import { TooltipModule } from 'app/shared/tooltips/tip.module';
import { ContextMenuModule } from 'app/shared/contextmenu/contextmenu.module';
import { DashboardComponent } from 'app/onion/dashboard/dashboard.component';
import { ModalModule } from 'app/shared/modals';
import { PopupModule } from 'app/shared/popups/popup.module';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    LearningObjectsComponent,
    AnalyticsComponent,
    UsersComponent,
    SearchBarComponent,
    ContentWrapperComponent,
    FilterSearchComponent,
    DashboardComponent
  ],
  providers: [ FilterSearchService ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    TooltipModule,
    ContextMenuModule,
    ModalModule,
    PopupModule,
    CommonModule,
    AdminRoutingModule,
    SharedModule,
  ]
})
export class AdminModule { }
