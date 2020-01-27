import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryComponent } from './library.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: LibraryComponent }])
  ],
  declarations: [
    // root component
    LibraryComponent,
  ],
})
export class LibraryModule { }
