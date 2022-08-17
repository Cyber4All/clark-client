import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LearningObjectsComponent } from './pages/learning-objects/learning-objects.component';
import { UsersComponent } from './pages/users/users.component';
import { ContentWrapperComponent } from './components/content-wrapper/content-wrapper.component';
import { FilterSearchComponent } from 'app/admin/components/filter-search/filter-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
// eslint-disable-next-line max-len
import { ChangeAuthorUserDropdownComponent } from './components/change-author/components/change-author-user-dropdown/change-author-user-dropdown.component';
import { FeaturedComponent } from './pages/featured/featured.component';
import { DraggableDashboardItemComponent } from './components/draggable-dashboard-item/draggable-dashboard-item.component';
import { DraggableLearningObjectComponent } from './components/draggable-learning-object/draggable-learning-object.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PaginationComponent } from './components/pagination/pagination.component';
import { RelevancyDateComponent } from './components/relevancy-date/relevancy-date.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { AddEvaluatorComponent } from './components/add-evaluator/add-evaluator.component';
import { ObjectDropdownComponent } from './components/add-evaluator/components/object-dropdown/object-dropdown.component';
import { SelectedUserComponent } from './components/add-evaluator/components/selected-user/selected-user.component';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { ChangeCollectionComponent } from './components/change-collection/change-collection.component';
import { HierarchyBuilderComponent } from './components/hierarchy-builder/hierarchy-builder.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatSelectModule } from '@angular/material/select';
import { HierarchyObjectComponent } from './components/hierarchy-builder/hierarchy-object/hierarchy-object.component';
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
    AddEvaluatorComponent,
    ObjectDropdownComponent,
    SelectedUserComponent,
    ChangeCollectionComponent,
    HierarchyBuilderComponent,
    HierarchyObjectComponent,
  ],
  imports: [
    CoreModule.forRoot(),
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    SharedModule,
    VirtualScrollerModule,
    DragDropModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule,
    MatTreeModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  providers: [LearningObjectService]
})
export class AdminModule { }
