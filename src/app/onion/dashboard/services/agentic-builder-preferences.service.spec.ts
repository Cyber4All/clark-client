import { TestBed } from "@angular/core/testing";

import { AgenticBuilderPreferencesService } from "./agentic-builder-preferences.service";

describe("AgenticBuilderPreferencesService", () => {
    let service: AgenticBuilderPreferencesService;
    const username = "author";

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AgenticBuilderPreferencesService);
        service.resetAnnouncementPreference(username);
    });

    afterEach(() => {
        service.resetAnnouncementPreference(username);
        service.resetAnnouncementPreference("another-author");
    });

    it("should show the announcement when it has not been dismissed", () => {
        expect(service.shouldShowAnnouncement(username)).toBe(true);
    });

    it("should hide the announcement after dismissal", () => {
        service.dismissAnnouncement(username);

        expect(service.shouldShowAnnouncement(username)).toBe(false);
    });

    it("should keep dismissal preferences scoped by user", () => {
        service.dismissAnnouncement(username);

        expect(service.shouldShowAnnouncement("another-author")).toBe(true);
    });
});
