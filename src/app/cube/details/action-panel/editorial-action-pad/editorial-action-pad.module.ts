import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviseButtonComponent } from './revise-button.component';
import { EditorialActionPadComponent } from './editorial-action-pad.component';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  declarations: [
    EditorialActionPadComponent,
    ReviseButtonComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [ EditorialActionPadComponent ],
  providers: [],
})
export class EditorialActionPadModule {}
