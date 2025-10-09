import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from '@env/environment';
import { ClarkModule } from 'app/clark.module';
import { CoralogixRumService } from './app/core/services/coralogix-rum.service';

// Application display name and Version information
const { version: appVersion, name: appName, displayName: appDisplayName } = require('../package.json');
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
  userVersion !== appVersion ? location.reload() :
    console.log(`${appDisplayName} running version: ${appVersion} - Up to date.`);
})();

// Initialize Coralogix RUM and bootstrap application if version matches
if (userVersion === appVersion) {
  try {
    const rumService = new CoralogixRumService();
    rumService.init();
  } catch (error) {
    console.error('Failed to initialize RUM service:', error);
  }

  // Bootstrap the application regardless of RUM initialization
  platformBrowserDynamic().bootstrapModule(ClarkModule);
} else {
  console.log('Waiting for update...');
}
