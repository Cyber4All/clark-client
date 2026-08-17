import { Injectable } from "@angular/core";

export interface FeatureAnnouncementPreference {
    featureKey: string;
    dismissed: boolean;
}

@Injectable({
    providedIn: "root",
})
export class FeatureAnnouncementPreferencesService {
    isDismissed(featureKey: string): boolean {
        return localStorage.getItem(featureKey) === "1";
    }

    updatePreference(preference: FeatureAnnouncementPreference): void {
        localStorage.setItem(
            preference.featureKey,
            preference.dismissed ? "1" : "0",
        );
    }
}
