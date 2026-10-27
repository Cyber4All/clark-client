import { TestBed } from "@angular/core/testing";
import {
    AgenticBuilderSessionState,
    AgenticBuilderSessionStorageService,
} from "./agentic-builder-session-storage.service";

describe("AgenticBuilderSessionStorageService", () => {
    let service: AgenticBuilderSessionStorageService;
    const state: AgenticBuilderSessionState = {
        selectedFields: {
            name: true,
            description: false,
            learningOutcomes: false,
        },
        reviewing: true,
        hasGeneratedSuggestions: true,
        hasGeneratedOutcomes: false,
        nameSuggestion: "Suggested name",
        appliedName: false,
        descriptionOptions: [],
        descriptionIndex: 0,
        appliedDescriptionIndex: null,
        outcomeSuggestions: [],
    };

    beforeEach(() => {
        window.sessionStorage.clear();
        TestBed.configureTestingModule({
            providers: [AgenticBuilderSessionStorageService],
        });
        service = TestBed.inject(AgenticBuilderSessionStorageService);
    });

    it("stores state by CUID and restores it for the same CUID", () => {
        service.activate("cuid-1");
        service.save("cuid-1", state);

        expect(service.activate("cuid-1")).toEqual(state);
        expect(
            window.sessionStorage.getItem(
                "clark.agentic-builder.suggestions.cuid-1",
            ),
        ).not.toBeNull();
    });

    it("clears the previous CUID when the active learning object changes", () => {
        service.activate("cuid-1");
        service.save("cuid-1", state);

        expect(service.activate("cuid-2")).toBeNull();
        expect(
            window.sessionStorage.getItem(
                "clark.agentic-builder.suggestions.cuid-1",
            ),
        ).toBeNull();
    });

    it("purges the active CUID when the builder session ends", () => {
        service.activate("cuid-1");
        service.save("cuid-1", state);

        service.clearActive();

        expect(
            window.sessionStorage.getItem(
                "clark.agentic-builder.suggestions.cuid-1",
            ),
        ).toBeNull();
    });
});
