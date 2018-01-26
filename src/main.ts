import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Global rxjs imports
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


// Application display name and Version information
const { version: appVersion } = require('../package.json');
const { displayName: appName } = require('../package.json');
const VERSION_STORE = 'version';

if (environment.production) {
  enableProdMode();
}

//Get the version of the application the user last ran
let userVersion = localStorage.getItem(VERSION_STORE);
(() => {
  //Set current version of the application
  localStorage.setItem(VERSION_STORE, appVersion);
  //Check the version of the application the user last ran; If mismatch clear cache via hard reload
  userVersion !== appVersion ? location.reload(true) :
    console.log(`${appName} running version: ${appVersion} - Up to date.`);
})();

//Verify correct version before bootstrapping application
userVersion === appVersion ? platformBrowserDynamic().bootstrapModule(AppModule) : console.log('Waiting for update...');
