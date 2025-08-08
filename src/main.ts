import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { ClarkModule } from 'app/clark.module';
import { environment } from '@env/environment';

// Global error handler for unhandled fetch errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message === 'Failed to fetch') {
    console.warn('Unhandled fetch rejection (likely analytics/tracking):', event.reason);
    // Prevent the error from showing in console if it's just a tracking/analytics failure
    event.preventDefault();
  }
});

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

// Verify correct version before bootstrapping application
userVersion === appVersion ? platformBrowserDynamic().bootstrapModule(ClarkModule) : console.log('Waiting for update...');
