import { enableProdMode, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from '@env/environment';

import { TitleCasePipe } from '@angular/common';
import { Title, BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { UrlSerializer } from '@angular/router';
import { CustomUrlSerializer } from './app/core/learning-object-module/custom-url-serliazer';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpConfigInterceptor } from './app/core/interceptor/httpconfig.interceptor';
import { CoralogixRumService } from './app/core/services/coralogix-rum.service';
import { ClarkRoutingModule } from './app/clark.routing';
import { SharedModule } from './app/shared/shared.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ChatbotModule } from 'app/shared/modules/chatbot/chatbot.module';
import { MarkdownModule } from 'ngx-markdown';
import { ClarkComponent } from './app/clark.component';

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

if (userVersion === appVersion) {
  bootstrapApplication(ClarkComponent, {
    providers: [
        importProvidersFrom(BrowserModule, ClarkRoutingModule, SharedModule, FormsModule, ChatbotModule, MarkdownModule),
        TitleCasePipe,
        Title,
        {
            provide: UrlSerializer,
            useClass: CustomUrlSerializer,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpConfigInterceptor,
            multi: true,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: (rumService: CoralogixRumService) => () => rumService.init(),
            deps: [CoralogixRumService],
            multi: true,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
    ]
});
} else {
  console.log('Waiting for update...');
}
