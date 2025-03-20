import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {MatRadioModule} from '@angular/material/radio';
import { CollectionIndexComponent } from './pages/collection-index/collection-index.component';
import { GenericPageComponent } from './pages/generic-page/generic-page.component';
import { SecurityInjectionsComponent } from './pages/security-injections/security-injections.component';
import { NiceChallengeModule } from './pages/nice-challenge/nice-challenge.module';
import { CollectionsRoutingModule } from './collection.routing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CollectionNcyteComponent } from './pages/collection-ncyte/collection-ncyte.component';
import { Collection502Component } from './pages/collection-502/collection-502.component';
import { IncludedModule } from './shared/included/included.module';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './pages/collection-ncyte/components/header/header.component';
import { AboutComponent } from './pages/collection-ncyte/components/about/about.component';
import { CubeSharedModule } from '../cube/shared/cube-shared.module';
import { CuratorsComponent } from './pages/collection-ncyte/components/curators/curators.component';
import { StatsComponent } from './pages/collection-ncyte/components/stats/stats.component';
import { Header502Component } from './pages/collection-502/components/header/header.component';
import { About502Component } from './pages/collection-502/components/about/about.component';
import { Curators502Component } from './pages/collection-502/components/curators/curators.component';
import { Stats502Component } from './pages/collection-502/components/stats/stats.component';
import { HeaderInfo502Component } from './pages/collection-502/components/header/header-info/header-info.component';
import { CuratorCardComponent } from './pages/collection-502/components/curators/components/curator-card/curator-card.component';
import { TitleComponent } from './pages/collection-502/components/title/title.component';
import { FeaturedComponent } from './pages/collection-502/components/featured/featured.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { NcyteDashboardComponent } from './pages/collection-ncyte/dashboard/dashboard.component';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SecurityInjectionsHeaderComponent } from './pages/security-injections/components/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { CyberskillsDashboardComponent } from './cyberskills-dashboard/cyberskills-dashboard.component';
import {
  CyberskillsFiltersComponent
} from './cyberskills-dashboard/components/cyberskills2work-filters/cyberskills-filters.component';
import { UsageStatsModule } from '../cube/usage-stats/usage-stats.module';
import { DetailsModule } from '../cube/details/details.module';
import { LibraryModule } from '../cube/library/library.module';
import { CyberskillsCardComponent } from './cyberskills-dashboard/components/cyberskills-card/cyberskills-card.component';
import { CyberskillsFilterDropdownComponent } from 
'./cyberskills-dashboard/components/cyberskills-filter-dropdown/cyberskills-filter-dropdown.component';

@NgModule({
  declarations: [
    CollectionIndexComponent,
    GenericPageComponent,
    SecurityInjectionsComponent,
    SecurityInjectionsHeaderComponent,
    CollectionNcyteComponent,
    HeaderComponent,
    AboutComponent,
    CuratorsComponent,
    StatsComponent,
    Collection502Component,
    Header502Component,
    About502Component,
    Curators502Component,
    Stats502Component,
    HeaderInfo502Component,
    CuratorCardComponent,
    TitleComponent,
    FeaturedComponent,
    NcyteDashboardComponent,
    CyberskillsDashboardComponent,
    CyberskillsCardComponent,
    CyberskillsFiltersComponent,
    CyberskillsFilterDropdownComponent
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
    CubeSharedModule,
    MatSlideToggleModule,
    MatIconModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatExpansionModule,
    UsageStatsModule,
    DetailsModule,
    LibraryModule
  ],
})
export class CollectionModule { }
