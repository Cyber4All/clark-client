import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorialActionPadComponent } from './editorial-action-pad.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [
    EditorialActionPadComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [ EditorialActionPadComponent ],
  providers: [],
})
export class EditorialActionPadModule {}
