import { Injectable } from "@angular/core";

const AGENTIC_BUILDER_ANNOUNCEMENT_DISMISSED_KEY =
    "clark_agentic_builder_dashboard_announcement_dismissed";

@Injectable({
    providedIn: "root",
})
export class AgenticBuilderPreferencesService {
    shouldShowAnnouncement(username?: string): boolean {
        return (
            localStorage.getItem(this.getAnnouncementKey(username)) !== "true"
        );
    }

    dismissAnnouncement(username?: string): void {
        localStorage.setItem(this.getAnnouncementKey(username), "true");
    }

    resetAnnouncementPreference(username?: string): void {
        localStorage.removeItem(this.getAnnouncementKey(username));
    }

    private getAnnouncementKey(username?: string): string {
        return `${AGENTIC_BUILDER_ANNOUNCEMENT_DISMISSED_KEY}:${
            username ? encodeURIComponent(username) : "anonymous"
        }`;
    }
}
