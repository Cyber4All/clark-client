import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { UrlSerializer } from '@angular/router';
import { CustomUrlSerializer } from './core/custom-url-serliazer';

import { ClarkComponent } from './clark.component';
import { ClarkRoutingModule } from './clark.routing';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnsupportedComponent } from './unsupported.component';
import { NotFoundComponent } from './not-found.component';
import { GenericCollectionLogoComponent } from './generic-collection-logo/generic-collection-logo.component';

@NgModule({
  imports: [
    BrowserModule,
    ClarkRoutingModule,
    SharedModule,
    CoreModule.forRoot(),
    BrowserAnimationsModule
  ],
  declarations: [ClarkComponent, UnsupportedComponent, NotFoundComponent, GenericCollectionLogoComponent],
  bootstrap: [ClarkComponent],
  providers: [{ provide: UrlSerializer, useClass: CustomUrlSerializer }]
})
export class ClarkModule {}
