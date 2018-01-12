import { RouterModule } from '@angular/router';
import { SharedModule } from './../shared/shared.module';
import { CurriculumGroupComponent } from '../shared/curriculum-group/curriculum-group.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CubeFacesComponent } from './cube-faces/cube-faces.component';
import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';

@NgModule({
  imports: [FormsModule, BrowserModule, SharedModule, RouterModule],
  exports: [HomeComponent],
  declarations: [
    HomeComponent,
    CubeFacesComponent
  ],
  providers: [],
})
export class HomeModule { }
