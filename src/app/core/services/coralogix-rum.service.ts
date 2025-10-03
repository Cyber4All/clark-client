import { Injectable } from '@angular/core';
import { CoralogixBrowserSdkConfig, CoralogixRum, UserContextConfig } from '@coralogix/browser';
import { environment } from '@env/environment';
import { COMMIT_HASH } from '../../../commit-hash';

// Application display name and Version information
const { version } = require('../../../../package.json');

// For staging, we'll use version + commit hash, otherwise use the package version
const getRumVersion = (): string => {
    if (environment.environment === 'staging') {
        return `${version}-${COMMIT_HASH}`;
    }
    return version;
};

@Injectable({
    providedIn: 'root'
})
export class CoralogixRumService {
    private isInitialized = false;

    constructor() { }

    /**
     * Initialize Coralogix RUM
     */
    init(): void {
        if (this.isInitialized) {
            return;
        }

        // Only initialize RUM in production environment
        if (!['production', 'staging'].includes(environment.environment)) {
            console.log('Coralogix RUM skipped - not in production/staging environment');
            return;
        }

        try {
            const rumVersion = getRumVersion();
            const rumConfig: CoralogixBrowserSdkConfig = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                public_key: environment.publicKey,
                application: `clark-${environment.environment}`,
                version: rumVersion,
                coralogixDomain: 'US1' as const,
            };

            console.log('Initializing Coralogix RUM...');
            console.log('RUM Configuration:', rumConfig);

            CoralogixRum.init(rumConfig);

            // Set additional labels for production tracking
            CoralogixRum.setLabels({
                applicationName: `clark-${environment.environment}`,
                environment: environment.environment,
            });

            this.isInitialized = true;
            console.log('Coralogix RUM initialized successfully for production');
        } catch (error) {
            console.error('Failed to initialize Coralogix RUM:', error);
        }
    }

    /**
     * Set user context for RUM tracking
     */
    setUserContext(userContext: UserContextConfig): void {
        if (!this.isInitialized) {
            return;
        }

        try {
            CoralogixRum.setUserContext(userContext);
        } catch (error) {
            console.error('Failed to set user context:', error);
        }
    }

    /**
     * Set custom labels for RUM tracking
     */
    setLabels(labels: Record<string, string | number | boolean>): void {
        if (!this.isInitialized) {
            return;
        }

        try {
            CoralogixRum.setLabels(labels);
        } catch (error) {
            console.error('Failed to set labels:', error);
        }
    }

    /**
     * Track custom events
     */
    trackEvent(eventName: string, properties?: Record<string, any>): void {
        if (!this.isInitialized) {
            return;
        }

        try {
            // If the CoralogixRum has a custom event method, use it
            // Otherwise, you can set labels to track the event
            this.setLabels({
                customEvent: eventName,
                ...properties
            });
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    /**
     * Check if RUM is initialized
     */
    get initialized(): boolean {
        return this.isInitialized;
    }
}
