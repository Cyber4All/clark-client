import { NgModule } from '@angular/core';

import { CollectionDetailsComponent } from './collection-details.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ActionPanelComponent } from './components/action-panel/action-panel.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CubeSharedModule,
    SharedModule,
    RouterModule
  ],
  exports: [],
  declarations: [CollectionDetailsComponent, ActionPanelComponent]
})
export class CollectionModule {}
