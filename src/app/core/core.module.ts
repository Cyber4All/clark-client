import { NgModule } from '@angular/core';
import { ModuleWithProviders } from '@angular/compiler/src/core';

import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';

import { CookieModule } from 'ngx-cookie';

@NgModule({
  imports: [CookieModule.forRoot()],
  exports: [],
  providers: [AuthGuard, AuthService],
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [AuthGuard, AuthService]
    };
  }
}
