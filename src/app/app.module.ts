import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from './filter-components/button.component';

@NgModule({
  declarations: [
    AppComponent,
    CurriculumGroupComponent,
    ButtonComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
