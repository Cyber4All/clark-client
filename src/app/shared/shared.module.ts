// Core
import { NgModule } from '@angular/core';

// CLARK Modules
import { SharedComponents } from './components/shared-components.module';
import { SharedDirectivesModule } from './directives/shared-directives.module';
import { SharedModules } from './modules/shared-modules.module';
import { SharedPipesModule } from './pipes/shared-pipes.module';

@NgModule({
  imports: [
    SharedComponents,
    SharedDirectivesModule,
    SharedModules,
    SharedPipesModule
  ],
  declarations: [],
  exports: [
    SharedComponents,
    SharedDirectivesModule,
    SharedModules,
    SharedPipesModule
  ]
})
export class SharedModule {}
