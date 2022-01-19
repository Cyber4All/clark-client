import * as Raven from 'raven-js';
import { ErrorHandler } from '@angular/core';
import { environment } from '@env/environment';

Raven
  .config('https://388e985e535a4dbd8ff593abde4b41c5@sentry.io/287724', {
    shouldSendCallback: function() {
      return environment.production;
    },
    release: '0e4fdef81448dcfa0e16ecc4433ff3997aa53572'
  })
  .install();

export class RavenErrorHandler extends ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
    if (!environment.production) {
      super.handleError(err);
    }
  }
}
