import { AcademicsModule } from './academics/academics.module';
import { ModalityModule } from './modality/modality.module';
import { SharedModule } from './shared/shared.module';
import { HomeModule } from './home/home.module';
import { HomeComponent } from './home/home.component';
import { ConfigService } from './config.service';
import { LearningObjectService } from './learning-object.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterMenuComponent } from './filter-menu/filter-menu.component';
import { AcademicsComponent } from './academics/academics.component';
import { MappingComponent } from './mapping/mapping.component';
import { ModalityComponent } from './modality/modality.component';

const appRoutes: Routes = [
  { path: 'academics', component: AcademicsComponent },
  { path: 'mapping',   component: MappingComponent },
  { path: 'modality',  component: ModalityComponent},
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Heroes List' }
  },
  { path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    FilterMenuComponent,
    MappingComponent,
],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
      // { enableTracing: true } // <-- debugging purposes only
    ),
    AcademicsModule,
    HomeModule,
    ModalityModule
  ],
  providers: [
    LearningObjectService,
    ConfigService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(configService: ConfigService) {
      const w: any = window;
      if (w) {
          Object.assign(configService.env, w.__env);
      }
  }}
