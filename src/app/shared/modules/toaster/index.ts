import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToasterService } from './toaster.service';
import { ToasterComponent } from './toaster.component';

/**
 * Details on how each class in the authentication module is used.
 *
 * @author Sean Donnelly
 */

export * from './toaster.service';
export * from './toaster.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [ToasterComponent],
  exports: [ToasterComponent]
})
export class ToasterModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ToasterModule,
      providers: [ToasterService]
    };
  }
}
