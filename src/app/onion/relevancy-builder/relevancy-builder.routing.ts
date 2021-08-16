import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OutcomePageComponent } from './pages/outcome-page/outcome-page.component';
import { RelevancyBuilderComponent } from './relevancy-builder.component';

const builder_routes: Routes = [
    { path: '', component: RelevancyBuilderComponent,
    children: [
      { path: '', redirectTo: 'mappings', pathMatch: 'full' },
      { path: 'mappings', component: OutcomePageComponent, data: { state: 'outcomes' } },
    ]
  }
];

export const BuilderRoutingModule: ModuleWithProviders = RouterModule.forChild(builder_routes);
