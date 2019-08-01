// Core
import { NgModule } from '@angular/core';
import { SharedComponents } from './shared components/shared-components.module';
import { SharedModules } from './shared modules/shared-modules.module';

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
