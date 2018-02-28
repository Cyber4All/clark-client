import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { ClarkComponent } from './clark.component';
import { ClarkRoutingModule } from './clark.routing';
import { CubeModule } from './cube/cube.module';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    ClarkRoutingModule,
    // CubeModule
  ],
  declarations: [ClarkComponent],
  providers: [/* TODO: Providers go here */],
  bootstrap: [ClarkComponent],
})
export class ClarkModule { }
