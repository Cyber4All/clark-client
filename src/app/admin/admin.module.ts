import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterSearchComponent } from 'app/admin/components/filter-search/filter-search.component';
import { SharedModule } from 'app/shared/shared.module';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing';
import { ChangeAuthorComponent } from './components/change-author/change-author.component';
import { ContentWrapperComponent } from './components/content-wrapper/content-wrapper.component';
import { LearningObjectListItemComponent } from './components/learning-object-list-item/learning-object-list-item.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AdminUserCardComponent } from './components/user-card/user-card.component';
import { PrivilegesListComponent } from './components/user-privileges/privileges-list/privileges-list.component';
import { UserPrivilegesComponent } from './components/user-privileges/user-privileges.component';
import { UserSearchWrapperComponent } from './components/user-search-wrapper/user-search-wrapper.component';
import { LearningObjectsComponent } from './pages/learning-objects/learning-objects.component';
import { OrganizationsComponent } from './pages/organizations/organizations.component';
import { UsersComponent } from './pages/users/users.component';
// eslint-disable-next-line max-len
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTreeModule } from '@angular/material/tree';
import { AddEvaluatorComponent } from './components/add-evaluator/add-evaluator.component';
import { ObjectDropdownComponent } from './components/add-evaluator/components/object-dropdown/object-dropdown.component';
import { SelectedUserComponent } from './components/add-evaluator/components/selected-user/selected-user.component';
// eslint-disable-next-line max-len
import { ChangeAuthorUserDropdownComponent } from './components/change-author/components/change-author-user-dropdown/change-author-user-dropdown.component';
import { ChangeCollectionComponent } from './components/change-collection/change-collection.component';
import { DraggableDashboardItemComponent } from './components/draggable-dashboard-item/draggable-dashboard-item.component';
import { DraggableLearningObjectComponent } from './components/draggable-learning-object/draggable-learning-object.component';
import { HierarchyBuilderComponent } from './components/hierarchy-builder/hierarchy-builder.component';
import { HierarchyObjectComponent } from './components/hierarchy-builder/hierarchy-object/hierarchy-object.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { RelevancyDateComponent } from './components/relevancy-date/relevancy-date.component';
import { FeaturedComponent } from './pages/featured/featured.component';

@NgModule({
  declarations: [
    AdminComponent,
    SidebarComponent,
    LearningObjectsComponent,
    UsersComponent,
    OrganizationsComponent,
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
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    SharedModule,
    DragDropModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule,
    MatTreeModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatStepperModule,
    MatSelectModule,
    ReactiveFormsModule,
    VirtualScrollerModule,
  ],
})
export class AdminModule { }
