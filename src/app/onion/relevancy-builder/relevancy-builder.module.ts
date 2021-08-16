import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { SharedModule } from 'app/shared/shared.module';
import { BuilderRoutingModule } from './relevancy-builder.routing';

import { RelevancyBuilderComponent } from './relevancy-builder.component';
import { OnionSharedModule } from '../shared/onion-shared.module';
import { BuilderNavbarComponent } from './components/builder-navbar/builder-navbar.component';
import { ColumnWrapperComponent } from './components/column-wrapper/column-wrapper.component';
import { EditorActionPanelComponent } from './components/editor-action-panel/editor-action-panel.component';
import { OutcomeComponent } from './components/outcome/outcome.component';
import { OutcomeTypeaheadComponent } from './components/outcome/outcome-typeahead/outcome-typeahead.component';
import { ScafoldComponent } from './components/scafold/scafold.component';
import { StandardOutcomesComponent } from './components/standard-outcomes/standard-outcomes.component';
import { OutcomePageComponent } from './pages/outcome-page/outcome-page.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { OutcomeListItemComponent } from './components/standard-outcomes/outcome-list-item/outcome-list-item.component';

@NgModule({
  declarations: [
    RelevancyBuilderComponent,
    BuilderNavbarComponent,
    ColumnWrapperComponent,
    EditorActionPanelComponent,
    OutcomeComponent,
    OutcomeTypeaheadComponent,
    ScafoldComponent,
    StandardOutcomesComponent,
    OutcomePageComponent,
    OutcomeListItemComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    BuilderRoutingModule,
    DragDropModule,
    ReactiveFormsModule,
    SharedModule,
    OnionSharedModule,
    VirtualScrollerModule
  ]
})
export class RelevancyBuilderModule { }
