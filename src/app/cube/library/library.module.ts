import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryComponent } from './library.component';
import { RouterModule } from '@angular/router';
import { NotificationCardComponent } from './components/notification-card/notification-card.component';
import { LibraryItemComponent } from './components/library-item/library-item.component';
import { SharedModules } from 'app/shared/modules/shared-modules.module';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: LibraryComponent }])
  ],
  declarations: [
    // root component
    LibraryComponent,
    NotificationCardComponent,
    LibraryItemComponent,
  ],
})
export class LibraryModule { }
