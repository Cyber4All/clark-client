import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BehaviorSubject } from "rxjs";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { AgenticBuilderPanelComponent } from "./agentic-builder-panel.component";
import { AgenticBuilderSessionStorageService } from "./agentic-builder-session-storage.service";
import { BuilderStore } from "../../builder-store.service";

describe("AgenticBuilderPanelComponent", () => {
    let fixture: ComponentFixture<AgenticBuilderPanelComponent>;
    let component: AgenticBuilderPanelComponent;
    let store: any;
    let learningObjectService: { buildLearningObject: jest.Mock };

    beforeEach(async () => {
        window.sessionStorage.clear();
        const learningObject: any = {
            id: "lo-1",
            cuid: "cuid-1",
            name: "Current name",
            description: "Current description",
        };
        const learningObjectEvent = new BehaviorSubject(learningObject);
        store = {
            learningObject,
            learningObjectEvent,
            setAgenticGeneration: jest.fn(),
            clearAgenticGeneration: jest.fn(),
            applyAgenticSuggestions: jest.fn(
                async (suggestions, acceptedFields, acceptedOutcomeIndexes) => {
                    if (acceptedFields.has("name")) {
                        learningObject.name = suggestions.name;
                    }
                    if (acceptedFields.has("description")) {
                        learningObject.description = suggestions.description;
                    }
                    for (const index of acceptedOutcomeIndexes) {
                        const outcome = suggestions.learningOutcomes[index];
                        learningObject.outcomes = [
                            ...(learningObject.outcomes || []),
                            outcome,
                        ];
                    }
                    learningObjectEvent.next(learningObject);
                },
            ),
        };
        learningObjectService = {
            buildLearningObject: jest.fn(async (_id, request) => {
                if (request.fields[0] === "name") {
                    return {
                        name: `Name ${learningObjectService.buildLearningObject.mock.calls.length}`,
                    };
                }
                if (request.fields[0] === "description") {
                    return {
                        description: `Description ${learningObjectService.buildLearningObject.mock.calls.length}`,
                    };
                }
                return {
                    learningOutcomes: [
                        { bloom: "apply", verb: "apply", text: "Outcome" },
                    ],
                };
            }),
        };

        await TestBed.configureTestingModule({
            imports: [AgenticBuilderPanelComponent],
            providers: [
                { provide: BuilderStore, useValue: store },
                AgenticBuilderSessionStorageService,
                {
                    provide: LearningObjectService,
                    useValue: learningObjectService,
                },
                {
                    provide: ToastrOvenService,
                    useValue: { error: jest.fn(), warning: jest.fn() },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AgenticBuilderPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it.each([
        [
            "TCP/IP Model Security: Layers, Protocols, and Network Defense",
            "TCP-IP Model Security: Layers, Protocols, and Network Defense",
        ],
        ['  "TCP\\IP" * Security  ', "TCP-IP Security"],
    ])(
        "normalizes generated names before review and apply: %s",
        async (name, expected) => {
            learningObjectService.buildLearningObject.mockResolvedValueOnce({
                name,
            });

            await component.generateMoreSuggestions("name");
            expect(component.nameSuggestion).toBe(expected);
            await component.useSelectedName();

            expect(store.applyAgenticSuggestions).toHaveBeenCalledWith(
                { name: expected },
                new Set(["name"]),
                new Set(),
            );
        },
    );

    it("rejects generated names that become empty after normalization", async () => {
        learningObjectService.buildLearningObject.mockResolvedValueOnce({
            name: '* " *',
        });

        await component.generateMoreSuggestions("name");

        expect(component.nameSuggestion).toBeNull();
        expect(component.sectionErrors.name).toContain("empty or invalid");
        expect(store.applyAgenticSuggestions).not.toHaveBeenCalled();
    });

    it("normalizes a cached title when restoring suggestions", async () => {
        await component.generateMoreSuggestions("name");
        const key = "clark.agentic-builder.suggestions.cuid-1";
        const saved = JSON.parse(window.sessionStorage.getItem(key)!);
        saved.nameSuggestion = "TCP/IP Model Security";
        window.sessionStorage.setItem(key, JSON.stringify(saved));

        const restored = TestBed.createComponent(AgenticBuilderPanelComponent);

        expect(restored.componentInstance.nameSuggestion).toBe(
            "TCP-IP Model Security",
        );
        restored.destroy();
    });

    it("requests one name, three descriptions, and appends outcomes for selected types", async () => {
        await component.generateSelected();

        const nameRequests =
            learningObjectService.buildLearningObject.mock.calls.filter(
                ([, request]) => request.fields[0] === "name",
            );
        const descriptionRequests =
            learningObjectService.buildLearningObject.mock.calls.filter(
                ([, request]) => request.fields[0] === "description",
            );

        expect(nameRequests).toHaveLength(1);
        expect(descriptionRequests).toHaveLength(3);
        expect(component.nameSuggestion).toBeTruthy();
        expect(component.descriptionOptions).toHaveLength(3);
        expect(component.outcomeSuggestions).toHaveLength(1);
        expect(component.reviewing).toBe(true);
        expect(component.hasGeneratedSuggestions).toBe(true);
        expect(store.learningObject.name).toBe("Current name");
        expect(store.learningObject.description).toBe("Current description");
        const serializedState = window.sessionStorage.getItem(
            "clark.agentic-builder.suggestions.cuid-1",
        );
        expect(serializedState).not.toBeNull();
        const savedState = JSON.parse(serializedState ?? "{}");
        expect(savedState.nameSuggestion).toBe(component.nameSuggestion);
        expect(savedState.descriptionOptions).toHaveLength(3);
        expect(savedState.outcomeSuggestions).toHaveLength(1);
    });

    it("restores saved suggestions when the panel is recreated for the same CUID", async () => {
        await component.generateSelected();

        const restoredFixture = TestBed.createComponent(
            AgenticBuilderPanelComponent,
        );
        const restoredComponent = restoredFixture.componentInstance;
        restoredFixture.detectChanges();

        expect(restoredComponent.nameSuggestion).toBe(component.nameSuggestion);
        expect(restoredComponent.descriptionOptions).toEqual(
            component.descriptionOptions,
        );
        expect(restoredComponent.outcomeSuggestions).toEqual(
            component.outcomeSuggestions,
        );
        expect(restoredComponent.reviewing).toBe(true);
    });

    it("clears the previous CUID and its suggestions when the learning object changes", async () => {
        await component.generateSelected();
        expect(
            window.sessionStorage.getItem(
                "clark.agentic-builder.suggestions.cuid-1",
            ),
        ).not.toBeNull();

        const nextLearningObject = {
            id: "lo-2",
            cuid: "cuid-2",
            name: "Another object",
            description: "Another description",
        };
        store.learningObject = nextLearningObject;
        store.learningObjectEvent.next(nextLearningObject);

        expect(
            window.sessionStorage.getItem(
                "clark.agentic-builder.suggestions.cuid-1",
            ),
        ).toBeNull();
        expect(component.nameSuggestion).toBeNull();
        expect(component.reviewing).toBe(false);
    });

    it("replaces the previous name suggestion without changing the description position", async () => {
        component.nameSuggestion = "Existing name";
        component.descriptionOptions = ["First", "Second"];
        component.descriptionIndex = 1;
        const previousDescriptionCalls =
            learningObjectService.buildLearningObject.mock.calls.length;

        await component.generateMoreSuggestions("name");

        expect(component.nameSuggestion).not.toBe("Existing name");
        expect(component.descriptionIndex).toBe(1);
        expect(
            learningObjectService.buildLearningObject.mock.calls.length -
                previousDescriptionCalls,
        ).toBe(1);
    });

    it("prevents duplicate generation for a section while allowing another section to generate", async () => {
        const nameBatch = component.generateMoreSuggestions("name");
        const duplicateNameBatch = component.generateMoreSuggestions("name");
        const descriptionBatch =
            component.generateMoreSuggestions("description");

        expect(component.loading.name).toBe(true);
        expect(component.loading.description).toBe(true);
        expect(learningObjectService.buildLearningObject).toHaveBeenCalledTimes(
            4,
        );
        await Promise.all([nameBatch, duplicateNameBatch, descriptionBatch]);
    });

    it("applies the current name suggestion and clears an outdated applied marker", async () => {
        component.nameSuggestion = "Suggested name";

        await component.useSelectedName();

        expect(store.learningObject.name).toBe("Suggested name");
        expect(component.nameSuggestion).toBe("Suggested name");
        expect(component.appliedName).toBe(true);

        store.learningObject.name = "Manually edited name";
        store.learningObjectEvent.next(store.learningObject);
        expect(component.appliedName).toBe(false);
    });

    it("applies the viewed description and keeps the carousel options", async () => {
        component.descriptionOptions = ["Description one", "Description two"];
        component.descriptionIndex = 1;

        await component.useCurrentDescription();

        expect(store.learningObject.description).toBe("Description two");
        expect(component.descriptionOptions).toEqual([
            "Description one",
            "Description two",
        ]);
        expect(component.appliedDescriptionIndex).toBe(1);

        store.learningObject.description = "Manually edited description";
        store.learningObjectEvent.next(store.learningObject);
        expect(component.appliedDescriptionIndex).toBeNull();
    });

    it("rejects descriptions over 1,500 characters without losing existing options", async () => {
        component.descriptionOptions = ["Existing description"];
        learningObjectService.buildLearningObject.mockResolvedValue({
            description: "x".repeat(1501),
        });

        await component.generateMoreSuggestions("description");

        expect(component.descriptionOptions).toEqual(["Existing description"]);
        expect(component.sectionErrors.description).toContain("invalid");
        expect(component.loading.description).toBe(false);
    });

    it("keeps existing name options when every additional request fails", async () => {
        component.nameSuggestion = "Existing name";
        learningObjectService.buildLearningObject.mockRejectedValue(
            new Error("request failed"),
        );

        await component.generateMoreSuggestions("name");

        expect(component.nameSuggestion).toBe("Existing name");
        expect(component.sectionErrors.name).toContain(
            "could not be generated",
        );
    });

    it("does not remove an option when applying its save fails", async () => {
        component.nameSuggestion = "Keep this option";
        store.applyAgenticSuggestions.mockRejectedValueOnce(
            new Error("save failed"),
        );

        await component.useSelectedName();

        expect(component.nameSuggestion).toBe("Keep this option");
        expect(component.appliedName).toBe(false);
    });

    it("keeps the outcomes section available after decisions and appends generated outcomes", async () => {
        component.hasGeneratedOutcomes = true;
        component.outcomeSuggestions = [
            { bloom: "apply", verb: "apply", text: "First outcome" },
        ];
        component.rejectOutcome(0);
        expect(component.outcomeSuggestions).toHaveLength(0);
        expect(component.hasGeneratedOutcomes).toBe(true);

        await component.generateMoreSuggestions("learningOutcomes");
        expect(component.outcomeSuggestions).toHaveLength(1);
    });

    it("preserves review state when the modal closes", () => {
        component.reviewing = false;
        component.hasGeneratedSuggestions = true;
        component.nameSuggestion = "Pending name";
        component.close();

        expect(component.reviewing).toBe(true);
        expect(component.nameSuggestion).toBe("Pending name");
    });

    it("uses accept suggestion check buttons for name and description and disables them while generating", () => {
        component.reviewing = true;
        component.nameSuggestion = "Suggested name";
        component.descriptionOptions = ["Suggested description"];
        fixture.detectChanges();

        const nameCheck = fixture.nativeElement.querySelector(
            ".name-suggestion .suggestion-check",
        ) as HTMLButtonElement;
        const descriptionCheck = fixture.nativeElement.querySelector(
            ".description-carousel .suggestion-check",
        ) as HTMLButtonElement;
        expect(nameCheck.getAttribute("tip")).toBe("Accept suggestion");
        expect(descriptionCheck.getAttribute("tip")).toBe("Accept suggestion");

        component.loading.name = true;
        component.loading.description = true;
        fixture.detectChanges();
        expect(nameCheck.disabled).toBe(true);
        expect(descriptionCheck.disabled).toBe(true);
    });

    it("shows every suggestion section and a generate action for unselected types", async () => {
        component.selectedFields = {
            name: true,
            description: false,
            learningOutcomes: false,
        };
        await component.generateSelected();
        fixture.detectChanges();

        expect(
            fixture.nativeElement.querySelectorAll(".suggestion-section"),
        ).toHaveLength(3);
        expect(component.nameSuggestion).toBeTruthy();
        expect(component.descriptionOptions).toHaveLength(0);
        expect(component.outcomeSuggestions).toHaveLength(0);
        expect(
            fixture.nativeElement.querySelector(
                '[aria-label="Generate description suggestions"]',
            ),
        ).not.toBeNull();
        expect(
            fixture.nativeElement.querySelector(
                '[aria-label="Generate learning outcome suggestions"]',
            ),
        ).not.toBeNull();
    });

    it("keeps Generate suggestions and Close in the footer and removes the header close button", () => {
        const footer = fixture.nativeElement.querySelector(
            ".agentic-builder-panel__footer",
        ) as HTMLElement;

        expect(footer.textContent).toContain("Generate suggestions");
        expect(footer.textContent).toContain("Close");
        expect(
            fixture.nativeElement.querySelector(
                ".agentic-builder-panel__header button",
            ),
        ).toBeNull();
    });
});
