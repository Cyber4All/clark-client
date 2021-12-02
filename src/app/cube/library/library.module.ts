import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryComponent } from './library.component';
import { RouterModule } from '@angular/router';
import { NotificationCardComponent } from './components/notification-card/notification-card.component';
import { LibraryItemComponent } from './components/library-item/library-item.component';
import { SharedModule } from 'app/shared/shared.module';
import { PaginationComponent } from './components/pagination/pagination.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: 'library', component: LibraryComponent }]),
    SharedModule
  ],
  declarations: [
    // root component
    LibraryComponent,
    NotificationCardComponent,
    LibraryItemComponent,
    PaginationComponent,
  ],
  exports: [
    PaginationComponent,
  ]
})
export class LibraryModule { }
