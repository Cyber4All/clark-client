/* eslint-disable @typescript-eslint/naming-convention */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoPageComponent } from './pages/info-page/info-page.component';
import { OutcomePageComponent } from './pages/outcome-page/outcome-page.component';
import { MaterialsPageComponent } from './pages/materials-page/materials-page.component';
import { LearningObjectBuilderComponent } from './learning-object-builder.component';


const builder_routes: Routes = [
  { path: '', component: LearningObjectBuilderComponent,
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      { path: 'info', component: InfoPageComponent, data: { state: 'info' } },
      { path: 'outcomes', component: OutcomePageComponent, data: { state: 'outcomes' } },
      { path: 'outcomes/:id', component: OutcomePageComponent, data: { state: 'outcomes' } },
      { path: 'materials', component: MaterialsPageComponent, data: { state: 'materials' } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(builder_routes)],
  exports: [RouterModule]
})
export class BuilderRoutingModule { }
