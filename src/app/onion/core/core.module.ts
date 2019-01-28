import { NgModule, ErrorHandler } from '@angular/core';
import { LearningObjectService } from './learning-object.service';
import { LearningObjectBuilderGuard } from './learning-object-builder.guard';

/**
 * All singleton services that are global to the onion feature module should be provided here.
 */
@NgModule({
  imports: [],
  exports: [],
  providers: [
    LearningObjectService,
    LearningObjectBuilderGuard
  ]
})
export class OnionCoreModule { }
