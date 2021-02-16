import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { GenericPageComponent } from './pages/generic-page/generic-page.component';
import { CuratorCardComponent } from './shared/included/curator-card/curator-card.component';
import { StatCardComponent } from './shared/included/stat-card/stat-card.component';
import { SecurityInjectionsComponent } from './pages/security-injections/security-injections.component';
import { NiceChallengeModule } from './pages/nice-challenge/nice-challenge.module';
import { CollectionsRoutingModule } from './collection.routing';
import { NO_ERRORS_SCHEMA } from '@angular/core';



@NgModule({
  declarations: [
    CollectionIndexComponent,
    GenericPageComponent,
    CuratorCardComponent,
    StatCardComponent,
    SecurityInjectionsComponent,
  ],
  imports: [
    CommonModule,
    CollectionsRoutingModule,
    NiceChallengeModule,
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class CollectionModule { }
