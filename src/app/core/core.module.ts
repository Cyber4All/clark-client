import { NgModule, ErrorHandler } from '@angular/core';
import { ModuleWithProviders } from '@angular/compiler/src/core';

import { AuthGuard } from './auth-guard.service';
import { UserVerifiedGuard } from './user-verified.guard';
import { AuthService } from './auth.service';
import { NavbarService } from './navbar.service';

import { CartV2Service } from './cartv2.service';
import { OutcomeService } from './outcome.service';
import { CookieModule } from 'ngx-cookie';

import { RatingService } from './rating.service';
import { ToasterModule } from '../shared/toaster';
import { ModalModule } from '../shared/modals';
import { UserService } from './user.service';
import { UserAgentService } from './user-agent.service';
import { MessagesService } from './messages.service';
import { RavenErrorHandler } from './error-handler';
import { ContextMenuModule } from 'ngx-contextmenu';
import { CollectionService } from './collection.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpConfigInterceptor } from './interceptor/httpconfig.interceptor';
import { AdminGuard } from './admin.guard';
import { AccessGroupGuard } from './access-group-guard';

@NgModule({
  imports: [
    HttpClientModule,
    CookieModule.forRoot(),
    ModalModule.forRoot(),
    ToasterModule.forRoot(),
    ContextMenuModule.forRoot()
  ],
  exports: []
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        AccessGroupGuard,
        AuthGuard,
        AdminGuard,
        AuthService,
        CartV2Service,
        CollectionService,
        UserService,
        OutcomeService,
        MessagesService,
        UserVerifiedGuard,
        RatingService,
        NavbarService,
        UserAgentService,
        { provide: ErrorHandler, useClass: RavenErrorHandler },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpConfigInterceptor,
          multi: true
        }
      ]
    };
  }
}
