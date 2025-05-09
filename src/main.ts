import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CoralogixRum } from '@coralogix/browser';

import { ClarkModule } from 'app/clark.module';
import { environment } from '@env/environment';

// Application display name and Version information
const {
  version: appVersion,
  name: appName,
  displayName: appDisplayName,
} = require('../package.json');
const VERSION_STORE = `${appName} version`;

if (environment.production) {
  enableProdMode();
}

// Get the version of the application the user last ran
const userVersion = localStorage.getItem(VERSION_STORE);
(() => {
  // Set current version of the application
  localStorage.setItem(VERSION_STORE, appVersion);
  // Check the version of the application the user last ran; If mismatch clear cache via hard reload
  userVersion !== appVersion
    ? location.reload()
    : console.log(
        `${appDisplayName} running version: ${appVersion} - Up to date.`,
      );
})();

// Verify correct version before bootstrapping application
userVersion === appVersion
  ? platformBrowserDynamic().bootstrapModule(ClarkModule)
  : console.log('Waiting for update...');

// Initializes the Coralogix RUM (public key is not sensitive)
CoralogixRum.init({
  /* eslint-disable @typescript-eslint/naming-convention */
  public_key: 'cxtp_GlIj9EmChWjtoKed8FuKjqfVmlPWhi',
  application: 'clark',
  version: appVersion,
  coralogixDomain: 'US1',
  traceParentInHeader: {
    enabled: true,
  },
  memoryUsageConfig: {
    enabled: true,
  },
  labels: {
    NODE_ENV: environment.environment,
  },
  sessionConfig: {
    keepSessionAfterReload: true,
  },
  networkExtraConfig: [
    {
      url: environment.apiURL,
      collectReqPayload: true,
      collectResPayload: true,
    },
    {
      url: environment.cardUrl,
      collectReqPayload: true,
      collectResPayload: true,
    },
    {
      url: environment.downtimeUrl,
      collectReqPayload: true,
      collectResPayload: true,
    },
  ],
});
