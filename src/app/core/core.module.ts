import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/compiler/src/core';

import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';

import { CartV2Service } from './cartv2.service';

import { CookieModule } from 'ngx-cookie';
import { ClickOutsideModule } from 'ng-click-outside';
import { CheckBoxModule } from 'clark-checkbox';
import { NotificationModule } from '../shared/notifications';
import { ModalModule } from '../shared/modals';

@NgModule({
  imports: [
    CookieModule.forRoot(),
    ModalModule.forRoot(),
    NotificationModule.forRoot()
  ],
  exports: [],
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [AuthGuard, AuthService, CartV2Service]
    };
  }
}
