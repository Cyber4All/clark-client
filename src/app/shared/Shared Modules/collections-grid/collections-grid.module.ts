import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionsGridComponent } from './collections-grid.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    CollectionsGridComponent,
  ],
  exports: [
    CollectionsGridComponent,
  ]
})
export class CollectionsGridModule { }
