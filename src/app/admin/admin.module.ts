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
import { ChangeAuthorComponent } from './components/change-author/change-author.component';
// tslint:disable-next-line: max-line-length
import { ChangeAuthorUserDropdownComponent } from './components/change-author/components/change-author-user-dropdown/change-author-user-dropdown.component';
import { FeaturedComponent } from './pages/featured/featured.component';
import { DraggableDashboardItemComponent } from './components/draggable-dashboard-item/draggable-dashboard-item.component';
import { DraggableLearningObjectComponent } from './components/draggable-learning-object/draggable-learning-object.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PaginationComponent } from './components/pagination/pagination.component';
import { RelevancyDateComponent } from './components/relevancy-date/relevancy-date.component';
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
    ChangeAuthorComponent,
    ChangeAuthorUserDropdownComponent,
    FeaturedComponent,
    DraggableDashboardItemComponent,
    DraggableLearningObjectComponent,
    PaginationComponent,
    RelevancyDateComponent,
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
