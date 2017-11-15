import { SharedModule } from './../shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AcademicsComponent } from './academics.component';

@NgModule({
  imports: [BrowserModule, SharedModule],
  exports: [],
  declarations: [AcademicsComponent],
  providers: [],
})
export class AcademicsModule { }
