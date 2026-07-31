import { Injectable } from "@angular/core";

export interface FeatureAnnouncementPreference {
    featureKey: string;
    username?: string;
    dismissed: boolean;
}

@Injectable({
    providedIn: "root",
})
export class FeatureAnnouncementPreferencesService {
    private readonly dismissedAnnouncements = new Set<string>();

    isDismissed(featureKey: string, username?: string): boolean {
        return this.dismissedAnnouncements.has(
            this.getPreferenceKey(featureKey, username),
        );
    }

    updatePreference(preference: FeatureAnnouncementPreference): void {
        const preferenceKey = this.getPreferenceKey(
            preference.featureKey,
            preference.username,
        );

        if (preference.dismissed) {
            this.dismissedAnnouncements.add(preferenceKey);
        } else {
            this.dismissedAnnouncements.delete(preferenceKey);
        }
    }

    private getPreferenceKey(featureKey: string, username?: string): string {
        const preferenceOwner = username || "anonymous";

        return `${preferenceOwner}:${featureKey}`;
    }
}
