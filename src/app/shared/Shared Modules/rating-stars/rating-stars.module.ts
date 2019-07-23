import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingStarsComponent } from './rating-stars.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    RatingStarsComponent
  ],
  exports: [
    RatingStarsComponent
  ],
})
export class RatingStarsModule { }
