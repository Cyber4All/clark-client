import * as Sentry from "@sentry/angular";
import {
    APP_INITIALIZER,
    ErrorHandler,
    importProvidersFrom,
} from "@angular/core";

import { environment } from "@env/environment";
import packageJson from "@package";

import { TitleCasePipe } from "@angular/common";
import {
    Title,
    BrowserModule,
    bootstrapApplication,
} from "@angular/platform-browser";
import { Router, UrlSerializer } from "@angular/router";
import { CustomUrlSerializer } from "./app/core/learning-object-module/custom-url-serliazer";
import {
    HTTP_INTERCEPTORS,
    provideHttpClient,
    withInterceptorsFromDi,
} from "@angular/common/http";
import { HttpConfigInterceptor } from "./app/core/interceptor/httpconfig.interceptor";
import { ClarkRoutingModule } from "./app/clark.routing";
import { SharedModule } from "./app/shared/shared.module";
import { provideAnimations } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { ChatbotModule } from "app/shared/modules/chatbot/chatbot.module";
import { MarkdownModule } from "ngx-markdown";
import { ClarkComponent } from "./app/clark.component";

const {
    displayName: appDisplayName,
    name: appName,
    version: appVersion,
} = packageJson;
const VERSION_STORE = `${appName} version`;
const SENTRY_ENABLED_ENVIRONMENTS = ["staging", "production"];

Sentry.init({
    dsn: "https://791057349c7a589e044c88bd5c9a2c19@o4511711309463552.ingest.us.sentry.io/4511711708381184",
    enabled: SENTRY_ENABLED_ENVIRONMENTS.includes(environment.environment),
    environment: environment.environment,
    release: appVersion,
    integrations: [
        Sentry.replayIntegration(),
        Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
        Sentry.feedbackIntegration({
            colorScheme: "system",
            autoInject: false,
        }),
    ],
    // Don't send traces
    tracesSampleRate: 0.5,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    enableLogs: true,
    beforeSend: (event) => ({
        ...event,
        environment: environment.environment,
    }),
    beforeSendTransaction: (event) => ({
        ...event,
        environment: environment.environment,
    }),
    beforeSendLog: (log) => ({
        ...log,
        attributes: {
            ...log.attributes,
            environment: environment.environment,
        },
    }),
});

// Web Storage can be missing entirely (ReferenceError) or throw on access
// (SecurityError/QuotaExceededError) in some Safari privacy/restricted contexts.
let storageAvailable = true;

function readStoredVersion(): string | null {
    try {
        return globalThis.localStorage.getItem(VERSION_STORE);
    } catch (error) {
        storageAvailable = false;
        console.warn(
            `${appDisplayName}: localStorage unavailable, skipping version check.`,
            error,
        );
        return null;
    }
}

function writeStoredVersion(version: string): void {
    try {
        globalThis.localStorage.setItem(VERSION_STORE, version);
    } catch (error) {
        storageAvailable = false;
        console.warn(
            `${appDisplayName}: unable to persist app version to localStorage.`,
            error,
        );
    }
}

// Get the version of the application the user last ran
const userVersion = readStoredVersion();
(() => {
    // Set current version of the application
    writeStoredVersion(appVersion);

    // Check the version of the application the user last ran; If mismatch clear cache via hard reload.
    // Only reload when storage works, otherwise the version can never match and we would reload forever.
    storageAvailable && userVersion !== appVersion
        ? location.reload()
        : console.log(
              `${appDisplayName} running version: ${appVersion} - Up to date.`,
          );
})();

if (!storageAvailable || userVersion === appVersion) {
    bootstrapApplication(ClarkComponent, {
        providers: [
            importProvidersFrom(
                BrowserModule,
                ClarkRoutingModule,
                SharedModule,
                FormsModule,
                ChatbotModule,
                MarkdownModule,
            ),
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
                provide: ErrorHandler,
                useValue: Sentry.createErrorHandler(),
            },
            {
                provide: Sentry.TraceService,
                deps: [Router],
            },
            {
                provide: APP_INITIALIZER,
                useFactory: () => () => {},
                deps: [Sentry.TraceService],
                multi: true,
            },
            provideHttpClient(withInterceptorsFromDi()),
            provideAnimations(),
        ],
    });
} else {
    console.log("Waiting for update...");
}
