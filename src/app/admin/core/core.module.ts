import { NgModule, ErrorHandler } from '@angular/core';
import { ModuleWithProviders } from '@angular/compiler/src/core';

import { PrivilegeService } from './privilege.service';

@NgModule({
  exports: []
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        PrivilegeService,
      ]
    };
  }
}
