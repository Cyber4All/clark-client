import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { GenericPageComponent } from './pages/generic-page/generic-page.component';
import { SecurityInjectionsComponent } from './pages/security-injections/security-injections.component';
import { NiceChallengeModule } from './pages/nice-challenge/nice-challenge.module';
import { CollectionsRoutingModule } from './collection.routing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CollectionNcyteComponent } from './pages/collection-ncyte/collection-ncyte.component';
import { LearningObjectService } from 'app/cube/learning-object.service';
import { IncludedModule } from './shared/included/included.module';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './pages/collection-ncyte/components/header/header.component';
import { AboutComponent } from './pages/collection-ncyte/components/about/about.component';
import { CubeSharedModule } from '../cube/shared/cube-shared.module';
@NgModule({
  declarations: [
    CollectionIndexComponent,
    GenericPageComponent,
    SecurityInjectionsComponent,
    CollectionNcyteComponent,
    HeaderComponent,
    AboutComponent,
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA
  ],
  imports: [
    CommonModule,
    IncludedModule,
    CollectionsRoutingModule,
    NiceChallengeModule,
    RouterModule,
    SharedModule,
    CubeSharedModule
  ],
  providers: [LearningObjectService]
})
export class CollectionModule { }
