// angular modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

// non-angular modules
import {BuilderRoutingModule} from './learning-object-builder.routing';
import {SharedModule} from 'app/shared/shared.module';
import {ContentUploadModule} from './components/content-upload/app/content-upload.module';
// components
import { LearningObjectBuilderComponent } from './learning-object-builder.component';
import { OutcomeComponent } from './components/outcome/outcome.component';
import { OutcomeTypeaheadComponent } from './components/outcome/outcome-typeahead/outcome-typeahead.component';
import { BuilderNavbarComponent } from './components/builder-navbar/builder-navbar.component';
import { InfoPageComponent } from './pages/info-page/info-page.component';
import { OutcomePageComponent } from './pages/outcome-page/outcome-page.component';
import { MaterialsPageComponent } from './pages/materials-page/materials-page.component';
import { MetadataComponent } from './pages/info-page/metadata/metadata.component';
import { ColumnWrapperComponent } from './components/column-wrapper/column-wrapper.component';
import { StandardOutcomesComponent } from './components/standard-outcomes/standard-outcomes.component';
import { OutcomesListItemComponent } from './components/standard-outcomes/outcomes-list-item/outcomes-list-item.component';
import { LearningObjectDescriptionComponent } from './components/description.component';
import { UserDropdownComponent } from './components/user-dropdown/user-dropdown.component';
import { ContributorPillComponent } from './components/contributor-pill/contributor-pill.component';
import { ScaffoldComponent } from './components/scaffold/scaffold.component';
import {OnionSharedModule} from '../shared/onion-shared.module';
import {EditorActionPanelModule} from './components/editor-action-panel/editor-action-panel.module';
import { AddChildComponent } from './components/scaffold/add-child/add-child.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { MaterialNotesComponent } from './components/material-notes/material-notes.component';
/*
  NOTE: BuilderStore and validator services aren't provided here, they're provided in the learning-object-builder.component file.
  This is because those services should be singletons across the builder, but cease to exist when the builder is
  destroyed (ie navigated away from).
*/

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BuilderRoutingModule,
    FormsModule,
    ContentUploadModule,
    ReactiveFormsModule,
    DragDropModule,
    OnionSharedModule,
    EditorActionPanelModule,
    OnionSharedModule,
    VirtualScrollerModule
  ],
  declarations: [
    LearningObjectBuilderComponent,
    BuilderNavbarComponent,
    OutcomeComponent,
    OutcomeTypeaheadComponent,
    MetadataComponent,
    InfoPageComponent,
    OutcomePageComponent,
    MaterialsPageComponent,
    ColumnWrapperComponent,
    StandardOutcomesComponent,
    OutcomesListItemComponent,
    LearningObjectDescriptionComponent,
    UserDropdownComponent,
    ContributorPillComponent,
    ScaffoldComponent,
    AddChildComponent,
    MaterialNotesComponent,
  ],
})
export class LearningObjectBuilderModule {}
