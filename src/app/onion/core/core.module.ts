import { NgModule, ErrorHandler } from '@angular/core';
import { LearningObjectService } from './learning-object.service';

/**
 * All singleton services that are global to the onion feature module should be provided here.
 */
@NgModule({
  imports: [],
  exports: [],
  providers: [
    LearningObjectService
  ]
})
export class OnionCoreModule { }
