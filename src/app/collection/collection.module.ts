import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { GenericPageComponent } from './pages/generic-page/generic-page.component';
import { CuratorCardComponent } from './shared/included/curator-card/curator-card.component';
import { StatCardComponent } from './shared/included/stat-card/stat-card.component';
import { C5Component } from './pages/c5/c5.component';
import { SecurityInjectionsComponent } from './pages/security-injections/security-injections.component';



@NgModule({
  declarations: [CollectionIndexComponent, GenericPageComponent, CuratorCardComponent, StatCardComponent, C5Component, SecurityInjectionsComponent],
  imports: [
    CommonModule
  ]
})
export class CollectionModule { }
