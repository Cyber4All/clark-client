import * as Raven from 'raven-js';
import { ErrorHandler } from '@angular/core';

Raven
  .config('https://388e985e535a4dbd8ff593abde4b41c5@sentry.io/287724')
  .install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err);
  }
}
