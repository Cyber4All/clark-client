import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details.component';
import { RouterModule } from '@angular/router';
import { SplashComponent } from './components/splash/splash.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: ':username/:learningObjectName', component: DetailsComponent, pathMatch: 'full' },
      { path: '', redirectTo: '/home', pathMatch: 'full' }
    ]),
  ],
  exports: [],
  declarations: [
    // root level component
    DetailsComponent,
    // page components
    SplashComponent
  ],
  providers: []
})
export class DetailsModule {}
