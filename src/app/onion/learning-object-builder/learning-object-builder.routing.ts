import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoPageComponent } from './pages/info-page/info-page.component';
import { OutcomePageComponent } from './pages/outcome-page/outcome-page.component';
import { MaterialsPageComponent } from './pages/materials-page/materials-page.component';
import { LearningObjectBuilderComponent } from './learning-object-builder.component';
import { ContentUploadModule } from '../content-upload/app/content-upload.module';


const builder_routes: Routes = [
  { path: '', component: LearningObjectBuilderComponent,
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      { path: 'info', component: InfoPageComponent },
      { path: 'outcomes', component: OutcomePageComponent },
      // { path: 'materials', component: MaterialsPageComponent }
      { path: 'materials', loadChildren: () => ContentUploadModule },
    ]
  }
];
export const BuilderRoutingModule: ModuleWithProviders = RouterModule.forChild(builder_routes);
