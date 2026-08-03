import { TestBed } from "@angular/core/testing";

import { FeatureAnnouncementPreferencesService } from "./feature-announcement-preferences.service";

describe("FeatureAnnouncementPreferencesService", () => {
    let service: FeatureAnnouncementPreferencesService;
    const featureKey = "Hide AI Announcemednt";

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FeatureAnnouncementPreferencesService);
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it("returns false when a feature has not been dismissed", () => {
        expect(service.isDismissed(featureKey)).toBe(false);
    });

    it("stores a dismissed feature announcement preference in localStorage", () => {
        service.updatePreference({
            featureKey,
            dismissed: true,
        });

        expect(localStorage.getItem(featureKey)).toBe("1");
        expect(service.isDismissed(featureKey)).toBe(true);
    });

    it("stores an active feature announcement preference", () => {
        service.updatePreference({
            featureKey,
            dismissed: true,
        });
        service.updatePreference({
            featureKey,
            dismissed: false,
        });

        expect(localStorage.getItem(featureKey)).toBe("0");
        expect(service.isDismissed(featureKey)).toBe(false);
    });
});
