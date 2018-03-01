import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { ClarkComponent } from './clark.component';
import { ClarkRoutingModule } from './clark.routing';
import { CubeModule } from './cube/cube.module';
import { RavenErrorHandler } from './error-handler';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    ClarkRoutingModule
  ],
  declarations: [ClarkComponent],
  providers: [
    process.env.NODE_ENV === 'production' ? { provide: ErrorHandler, useClass: RavenErrorHandler } : ErrorHandler
  ],
  bootstrap: [ClarkComponent],
})
export class ClarkModule { }
