import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LearningObjectsComponent } from './pages/learning-objects/learning-objects.component';
import { UsersComponent } from './pages/users/users.component';
import { ContentWrapperComponent } from './components/content-wrapper/content-wrapper.component';
import { FilterSearchComponent } from 'app/admin/components/filter-search/filter-search.component';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SharedModule } from 'app/shared/shared.module';
import { UserSearchWrapperComponent } from './components/user-search-wrapper/user-search-wrapper.component';
import { AdminUserCardComponent } from './components/user-card/user-card.component';
import { UserPrivilegesComponent } from './components/user-privileges/user-privileges.component';
import { PrivilegesListComponent } from './components/user-privileges/privileges-list/privileges-list.component';
import { CoreModule } from './core/core.module';
import { LearningObjectListItemComponent } from './components/learning-object-list-item/learning-object-list-item.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { FeaturedObjectsComponent } from './pages/featured-objects/featured-objects.component';
import { FeaturedListComponent } from './components/featured-list/featured-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    LearningObjectsComponent,
    UsersComponent,
    SearchBarComponent,
    ContentWrapperComponent,
    FilterSearchComponent,
    UserSearchWrapperComponent,
    AdminUserCardComponent,
    UserPrivilegesComponent,
    PrivilegesListComponent,
    LearningObjectListItemComponent,
    FeaturedObjectsComponent,
    FeaturedListComponent,
  ],
  imports: [
    CoreModule.forRoot(),
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    FormsModule,
    VirtualScrollerModule,
    DragDropModule,
  ],
})
export class AdminModule { }
