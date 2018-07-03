import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import {UrlSerializer} from '@angular/router';
import { CustomUrlSerializer } from './core/custom-url-serliazer';

import { ClarkComponent } from './clark.component';
import { ClarkRoutingModule } from './clark.routing';
import { CubeModule } from './cube/cube.module';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { OnionComponent } from './onion/onion.component';
import { OnionModule } from './onion/onion.module';
import { NotificationModule } from './shared/notifications';
import { ModalModule } from './shared/modals';
import { AuthService } from './core/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnsupportedComponent } from './unsupported.component';


@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    ClarkRoutingModule,
    SharedModule,
    CoreModule.forRoot(),
    BrowserAnimationsModule
  ],
  declarations: [
    ClarkComponent,
    UnsupportedComponent,
],
  bootstrap: [ClarkComponent],
  providers: [{provide: UrlSerializer, useClass: CustomUrlSerializer}]
})
export class ClarkModule {}
