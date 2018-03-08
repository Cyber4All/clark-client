// Core
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Routes
import { RoutingModule } from './app.routing';

// Services
import { ConfigService } from './config.service';
import { LearningObjectService } from './learning-object.service';
import { CartService } from './shared/services/cart.service';
import { CartV2Service } from './shared/services/cartv2.service';

// Redux
import { StoreModule } from '@ngrx/store';
import { cartReducer } from './shared/redux/reducers/cart.reducer';

// Pipes
import { EscapeHtmlPipe } from './shared/pipes/keep-html.pipe';


// Modules
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';
import { ModalModule } from '@cyber4all/clark-modal';
import { NotificationModule } from 'clark-notification';
import { CheckBoxModule } from 'clark-checkbox';
import { AuthModule } from './auth/auth.module';
import { ClickOutsideModule } from 'ng-click-outside';
import { ParticlesModule } from 'angular-particle';

// Components
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './learning-object-details/details/details.component';
import { DetailsContentComponent } from './learning-object-details/details/details-content.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { RouterComponent } from './shared/breadcrumb/router.component';

// Guards
import { AuthGuard } from './auth/services/auth-guard.service';

// Other
import { RavenErrorHandler } from './error-handler';
import { VirtualScrollModule } from 'angular2-virtual-scroll';
import { AuthService } from './auth/services/auth.service';
import { UserInformationComponent } from './user-information/user-information.component';

@NgModule({
  declarations: [
    AppComponent,
    EscapeHtmlPipe,
    DetailsComponent,
    DetailsContentComponent,
    CartComponent, // TODO Create Details module
    DetailsContentComponent, // TODO Create Details module
    RouterComponent,
    BrowseComponent, UserProfileComponent, UserPreferencesComponent, UserInformationComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    RoutingModule,
    HomeModule,
    SharedModule,
    StoreModule.forRoot({ cart: cartReducer }),
    ModalModule.forRoot(),
    NotificationModule.forRoot(),
    CheckBoxModule,
    AuthModule.forRoot(),
    ClickOutsideModule,
    ParticlesModule,
    VirtualScrollModule
  ],
  providers: [
    LearningObjectService,
    ConfigService,
    CartService,
    CartV2Service,
    AuthGuard,
    AuthService,
    process.env.NODE_ENV === 'production' ? { provide: ErrorHandler, useClass: RavenErrorHandler } : ErrorHandler,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(configService: ConfigService) {
    const w: any = window;
    if (w) {
      Object.assign(configService.env, w.__env);
    }
    console.log(process.env.NODE_ENV);
  }
}
