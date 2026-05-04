// Core
import { NgModule } from '@angular/core';

// CLARK Modules


import { SharedModules } from './modules/shared-modules.module';


@NgModule({
  imports: [
    SharedModules
],
  declarations: [],
  exports: [
    SharedModules
]
})
export class SharedModule {}
