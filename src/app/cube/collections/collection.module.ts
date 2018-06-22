import { NgModule } from '@angular/core';

import { CollectionComponent } from './collection.component';
import { CollectionService } from './collection.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CubeSharedModule } from '../shared/cube-shared.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    CubeSharedModule,
    SharedModule
  ],
  exports: [],
  declarations: [CollectionComponent],
  providers: [CollectionService],
})
export class CollectionModule { }
