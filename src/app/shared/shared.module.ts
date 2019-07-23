// Core
import { NgModule } from '@angular/core';
import { SharedComponents } from './Shared Components/shared-components.module';
import { SharedModules } from './Shared Modules/shared-modules.module';

@NgModule({
  imports: [
    SharedComponents,
    SharedModules
  ],
  declarations: [
  ],
  exports: [
    SharedComponents,
    SharedModules
  ]
})
export class SharedModule {}
