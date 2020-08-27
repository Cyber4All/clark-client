import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { GenericPageComponent } from './pages/generic-page/generic-page.component';



@NgModule({
  declarations: [CollectionIndexComponent, GenericPageComponent],
  imports: [
    CommonModule
  ]
})
export class CollectionModule { }
