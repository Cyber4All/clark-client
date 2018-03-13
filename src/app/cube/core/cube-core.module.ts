import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Services
import { OutcomeService } from './services/outcome.service';

/**
 * Contains all singleton services for the cube module.
 *
 * @class CubeCoreModule
 */
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [],
  providers: [
    OutcomeService
  ]
})
export class CubeCoreModule {
  // Ensure that the module is only imported by one NgModule
  constructor(@Optional() @SkipSelf() parentModule: CubeCoreModule) {
    if (parentModule) {
      throw new Error('CubeCoreModule has already been loaded! This module may only be loaded once.');
    }
  }
}
