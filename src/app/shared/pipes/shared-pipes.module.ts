// Core
import { NgModule } from '@angular/core';
import {CollectionPipe} from './collection.pipe';


@NgModule({
  declarations: [
    CollectionPipe
  ],
  exports: [
    CollectionPipe
  ]
})
export class SharedPipesModule {}
