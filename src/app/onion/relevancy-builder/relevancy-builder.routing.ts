import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OutcomePageComponent } from './pages/outcome-page/outcome-page.component';
import { TopicPageComponent } from './pages/topic-page/topic-page.component';
import { RelevancyBuilderComponent } from './relevancy-builder.component';

const builder_routes: Routes = [
    { path: '', component: RelevancyBuilderComponent,
    children: [
      { path: '', redirectTo: 'outcomes', pathMatch: 'full'},
      { path: 'outcomes', component: OutcomePageComponent, data: { state: 'outcomes' }},
      { path: 'topics', component: TopicPageComponent }
    ]
  }
];

export const BuilderRoutingModule: ModuleWithProviders = RouterModule.forChild(builder_routes);
