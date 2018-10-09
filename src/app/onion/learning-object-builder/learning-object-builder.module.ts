import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearningObjectBuilderComponent } from './learning-object-builder.component';
import { OutcomeComponent } from './components/outcome/outcome.component';
import { OutcomeTypeaheadComponent } from './components/outcome/outcome-typeahead/outcome-typeahead.component';
import { BuilderNavbarComponent } from './components/builder-navbar/builder-navbar.component';
import { InfoPageComponent } from './pages/info-page/info-page.component';
import { OutcomePageComponent } from './pages/outcome-page/outcome-page.component';
import { MaterialsPageComponent } from './pages/materials-page/materials-page.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { WrapperComponent } from './pages/info-page/wrapper/wrapper.component';
import { MetadataComponent } from './pages/info-page/metadata/metadata.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  declarations: [
    LearningObjectBuilderComponent,
    OutcomeComponent,
    OutcomeTypeaheadComponent,
    BuilderNavbarComponent,
    InfoPageComponent,
    OutcomePageComponent,
    MaterialsPageComponent,
    WrapperComponent,
    MetadataComponent
  ],
})
export class LearningObjectBuilderModule { }
