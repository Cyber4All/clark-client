import { TestBed } from "@angular/core/testing";

import { FeatureAnnouncementPreferencesService } from "./feature-announcement-preferences.service";

describe("FeatureAnnouncementPreferencesService", () => {
    let service: FeatureAnnouncementPreferencesService;
    const featureKey = "agentic-builder-dashboard";
    const username = "author";

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FeatureAnnouncementPreferencesService);
    });

    it("returns false when a feature has not been dismissed", () => {
        expect(service.isDismissed(featureKey, username)).toBe(false);
    });

    it("stores a dismissed feature announcement preference for the current app session", () => {
        service.updatePreference({
            featureKey,
            username,
            dismissed: true,
        });

        expect(service.isDismissed(featureKey, username)).toBe(true);
    });

    it("removes a dismissed feature announcement preference", () => {
        service.updatePreference({
            featureKey,
            username,
            dismissed: true,
        });
        service.updatePreference({
            featureKey,
            username,
            dismissed: false,
        });

        expect(service.isDismissed(featureKey, username)).toBe(false);
    });
});
