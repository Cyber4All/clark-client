import { NgModule, ErrorHandler } from '@angular/core';
import { ModuleWithProviders } from '@angular/core';

import { PrivilegeService } from './privilege.service';

@NgModule({
  exports: []
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<any> {
    return {
      ngModule: CoreModule,
      providers: [
        PrivilegeService,
      ]
    };
  }
}
