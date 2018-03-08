import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { ClarkComponent } from './clark.component';
import { ClarkRoutingModule } from './clark.routing';
import { CubeModule } from './cube/cube.module';
import { RavenErrorHandler } from './error-handler';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';
import { OnionComponent } from './onion/onion.component';
import { OnionModule } from './onion/onion.module';
import { NotificationModule } from './shared/notifications';
import { ModalModule } from './shared/modals';
import { AuthService } from './core/auth.service';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    ClarkRoutingModule,
    SharedModule,
    CoreModule.forRoot(),
  ],
  declarations: [ClarkComponent],
  providers: [
    // process.env.NODE_ENV === 'production' ? { provide: ErrorHandler, useClass: RavenErrorHandler } : ErrorHandler
  ],
  bootstrap: [ClarkComponent],
})
export class ClarkModule { }
