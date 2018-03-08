import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from './notification.service';
import { NotificationComponent } from './notification.component';

/**
 * Details on how each class in the authentication module is used.
 * 
 * @author Sean Donnelly
 */

export * from './notification.service';
export * from './notification.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [NotificationComponent],
  exports: [NotificationComponent]
})
export class NotificationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NotificationModule,
      providers: [NotificationService]
    };
  }
}
