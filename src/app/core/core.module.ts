import { NgModule, ErrorHandler } from '@angular/core';

import { AuthGuard } from './auth-guard.service';
import { UserVerifiedGuard } from './user-verified.guard';
import { AuthService } from './auth.service';
import { NavbarService } from './navbar.service';

import { LibraryService } from './library.service';
import { GuidelineService } from './guideline.service';
import { CookieModule } from 'ngx-cookie';

import { RatingService } from './rating.service';
import { ModalModule } from '../shared/modules/modals/modal.module';
import { UserService } from './user.service';
import { UserAgentService } from './user-agent.service';
import { MessagesService } from './messages.service';
import { CollectionService } from './collection.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpConfigInterceptor } from './interceptor/httpconfig.interceptor';
import { AdminGuard } from './admin.guard';
import { AccessGroupGuard } from './access-group-guard';
import { ChangelogService } from './changelog.service';
import { EditorService } from './editor.service';
import { SharedModule } from 'app/shared/shared.module';
import { ProfileService } from './profiles.service';
import { NavbarDropdownService } from './navBarDropdown.service';

@NgModule({
  imports: [
    HttpClientModule,
    CookieModule.forRoot(),
    ModalModule.forRoot(),
    SharedModule
  ],
  providers: [
    AccessGroupGuard,
    AuthGuard,
    AdminGuard,
    AuthService,
    LibraryService,
    ChangelogService,
    CollectionService,
    EditorService,
    UserService,
    GuidelineService,
    MessagesService,
    UserVerifiedGuard,
    RatingService,
    NavbarService,
    UserAgentService,
    ProfileService,
    NavbarDropdownService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true
    }
  ]
})
export class CoreModule { }
