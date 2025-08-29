import { Injectable } from '@angular/core';
import { CoralogixRum } from '@coralogix/browser';
import { environment } from '@env/environment';

// Application display name and Version information
const { version: appVersion } = require('../../../../package.json');

@Injectable({
    providedIn: 'root'
})
export class CoralogixRumService {
    private readonly publicKey = 'cxtp_pbDbZsDUdNr5Wu3GWX6emisZyfKkV9';
    private readonly sourceMappingKey = 'cxtp_c7LgtyyyBwdnHVWUapJJESO9vWkNuu';
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
        if (!environment.production) {
            console.log('Coralogix RUM skipped - not in production environment');
            return;
        }

        try {
            const rumConfig = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                public_key: this.publicKey,
                application: 'clark-production',
                subsystem: 'frontend',
                version: appVersion,
                coralogixDomain: 'US1' as const
            };

            console.log('Initializing Coralogix RUM for production');
            console.log('RUM Configuration:', rumConfig);

            CoralogixRum.init(rumConfig);

            // Set additional labels for production tracking
            CoralogixRum.setLabels({
                applicationName: 'clark-production',
                environment: 'production',
                deploymentType: 'production'
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
    setUserContext(userContext: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_id: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_name: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_email: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        user_metadata?: Record<string, any>;
    }): void {
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
