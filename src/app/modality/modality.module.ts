import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';

import { ModalityComponent } from './modality.component';

@NgModule({
  imports: [BrowserModule, SharedModule],
  exports: [],
  declarations: [ModalityComponent],
  providers: [],
})
export class ModalityModule { }
