import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { TitleCasePipe } from '@angular/common';

import { UrlSerializer } from '@angular/router';
import { CustomUrlSerializer } from './core/custom-url-serliazer';

import { ClarkComponent } from './clark.component';
import { ClarkRoutingModule } from './clark.routing';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnsupportedComponent } from './unsupported.component';
import { NotFoundComponent } from './not-found.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CookiesComponent } from './components/cookies/cookies.component';
import { MessageComponent } from './components/message/message.component';
import { SearchComponent } from './components/search/search.component';
import { MaintenancePageComponent } from './maintenance-page/maintenance-page.component';
import { UnauthorizedComponent } from './unauthorized.component';
import { FormsModule } from '@angular/forms';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { PrimaryNavbarComponent } from './components/primary-navbar/primary-navbar.component';
import { SecondaryNavbarComponent } from './components/secondary-navbar/secondary-navbar.component';
import { RedirectComponent } from './redirect/redirect.component';
import { SafeHtmlPipe } from './components/safe-html.pipe';

@NgModule({
  imports: [
    BrowserModule,
    ClarkRoutingModule,
    SharedModule,
    CoreModule,
    BrowserAnimationsModule,
    ScrollingModule,
    FormsModule
  ],
  declarations: [
    ClarkComponent,
    UnsupportedComponent,
    NotFoundComponent,
    CookiesComponent,
    MessageComponent,
    SearchComponent,
    MaintenancePageComponent,
    UnauthorizedComponent,
    SubscriptionComponent,
    PrimaryNavbarComponent,
    SecondaryNavbarComponent,
    RedirectComponent,
    SafeHtmlPipe
  ],
  bootstrap: [ClarkComponent],
  providers: [TitleCasePipe, Title, { provide: UrlSerializer, useClass: CustomUrlSerializer }]
})
export class ClarkModule { }
