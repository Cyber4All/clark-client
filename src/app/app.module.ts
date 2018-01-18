// Core
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Routes
import { RoutingModule } from './app.routing';

// Services
import { ConfigService } from './config.service';
import { LearningObjectService } from './learning-object.service';
import { CartService } from './shared/services/cart.service'

// Redux
import { StoreModule } from '@ngrx/store';
import { cartReducer } from './shared/redux/reducers/cart.reducer';

// Pipes
import { EscapeHtmlPipe } from './shared/pipes/keep-html.pipe';


// Modules
import { HomeModule } from './home/home.module';
import { AcademicsModule } from './academics/academics.module';
import { SuggestionModule } from './suggestion/suggestion.module';
import { SharedModule } from './shared/shared.module';
import { ModalityModule } from './modality/modality.module';

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FilterMenuComponent } from './filter-menu/filter-menu.component';
import { AcademicsComponent } from './academics/academics.component';
import { MappingComponent } from './mapping/mapping.component';
import { ModalityComponent } from './modality/modality.component';
import { DetailsComponent } from './learning-object-details/details/details.component';
import { DetailsContentComponent } from './learning-object-details/details/details-content.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    FilterMenuComponent,
    MappingComponent,
    EscapeHtmlPipe,
    DetailsComponent,
    DetailsContentComponent,
    CartComponent, // TODO Create Details module
    DetailsContentComponent, // TODO Create Details module
    BrowseComponent, UserProfileComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    RoutingModule,
    AcademicsModule,
    HomeModule,
    ModalityModule,
    SuggestionModule,
    SharedModule,
    StoreModule.forRoot({ cart: cartReducer })
  ],
  providers: [
    LearningObjectService,
    ConfigService,
    CartService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(configService: ConfigService) {
    const w: any = window;
    if (w) {
      Object.assign(configService.env, w.__env);
    }
  }
}
