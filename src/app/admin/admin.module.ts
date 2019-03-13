import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LearningObjectsComponent } from './pages/learning-objects/learning-objects.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { UsersComponent } from './pages/users/users.component';
import { ContentWrapperComponent } from './components/content-wrapper/content-wrapper.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SharedModule } from 'app/shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AdminUserCardComponent } from './components/user-card/user-card.component';
import { ReviewersComponent } from './pages/reviewers/reviewers.component';
import { BuilderStore } from 'app/onion/learning-object-builder/builder-store.service';



@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    LearningObjectsComponent,
    AnalyticsComponent,
    UsersComponent,
    ReviewersComponent,
    ContentWrapperComponent,
    SearchBarComponent,
    AdminUserCardComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    ScrollingModule,
  ]
})
export class AdminModule { }
