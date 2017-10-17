import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';

@NgModule({
  declarations: [
    AppComponent,
    CurriculumGroupComponent
],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
