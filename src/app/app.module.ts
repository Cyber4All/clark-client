import { ConfigService } from './config.service';
import { LearningObjectService } from './learning-object.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CurriculumGroupComponent } from './curriculum-group/curriculum-group.component';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterMenuComponent } from './filter-menu/filter-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    CurriculumGroupComponent,
    FilterMenuComponent
],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule
  ],
  providers: [
    LearningObjectService,
    ConfigService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(configService: ConfigService) {
      const w: any = window;
      if (w) {
          Object.assign(configService.env, w.__env);
      }
  }}
