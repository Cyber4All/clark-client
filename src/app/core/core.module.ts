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
import { ToasterModule } from '../shared/shared modules/toaster';
import { ModalModule } from '../shared/shared modules/modals/modal.module';
import { UserService } from './user.service';
import { UserAgentService } from './user-agent.service';
import { MessagesService } from './messages.service';
import { RavenErrorHandler } from './error-handler';
import { CollectionService } from './collection.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpConfigInterceptor } from './interceptor/httpconfig.interceptor';
import { AdminGuard } from './admin.guard';
import { AccessGroupGuard } from './access-group-guard';
import { ChangelogService } from './changelog.service';
import { EditorService } from './editor.service';

@NgModule({
  imports: [
    HttpClientModule,
    CookieModule.forRoot(),
    ModalModule.forRoot(),
    ToasterModule.forRoot(),
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
        ChangelogService,
        CollectionService,
        EditorService,
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
