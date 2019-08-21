import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details.component';
import { RouterModule } from '@angular/router';
import { SplashComponent } from './components/splash/splash.component';
import { LengthComponent } from './components/splash/length/length.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([ { path: '', component: DetailsComponent } ]),
  ],
  exports: [],
  declarations: [
    // root level component
    DetailsComponent,
    // page components
    SplashComponent,
    LengthComponent
  ],
  providers: []
})
export class DetailsModule {}
