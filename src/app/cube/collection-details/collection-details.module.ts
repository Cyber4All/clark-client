import { NgModule } from '@angular/core';

import { CollectionDetailsComponent } from './collection-details.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ActionPanelComponent } from './components/action-panel/action-panel.component';
import { FaqSectionComponent } from './faq-section/faq-section.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CubeSharedModule,
    SharedModule,
    RouterModule,
    MatExpansionModule,
    MatDividerModule
  ],
  exports: [],
  declarations: [
    CollectionDetailsComponent,
    ActionPanelComponent,
    FaqSectionComponent
  ]
})
export class CollectionModule {}
