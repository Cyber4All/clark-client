import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelevancyBuilderComponent } from './relevancy-builder.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { OnionSharedModule } from '../shared/onion-shared.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { BuilderNavbarComponent } from './components/builder-navbar/builder-navbar.component';
import { ColumnWrapperComponent } from './components/column-wrapper/column-wrapper.component';
import { EditorActionPanelComponent } from './components/editor-action-panel/editor-action-panel.component';
import { OutcomeComponent } from './components/outcome/outcome.component';
import { OutcomeTypeaheadComponent } from './components/outcome/outcome-typeahead/outcome-typeahead.component';
import { ScafoldComponent } from './components/scafold/scafold.component';
import { StandardOutcomesComponent } from './components/standard-outcomes/standard-outcomes.component';

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
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: RelevancyBuilderComponent
      }
    ]),
    SharedModule,
    OnionSharedModule,
  ],
  exports: [
    RelevancyBuilderComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class RelevancyBuilderModule { }
