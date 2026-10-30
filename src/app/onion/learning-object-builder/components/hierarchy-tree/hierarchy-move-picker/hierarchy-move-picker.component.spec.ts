import {
    ComponentFixture,
    fakeAsync,
    flush,
    TestBed,
    waitForAsync,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { LearningObject } from "@entity";

import { HierarchyMovePickerComponent } from "./hierarchy-move-picker.component";
import { HierarchyNode, MoveDestination } from "../hierarchy-tree.types";

/**
 * Component tests for `HierarchyMovePickerComponent`
 *
 * The picker is presentation-only: it renders the moving node's name, lists the
 * valid destinations as a CDK listbox, gates its confirm control on a selection,
 * and emits `confirm`/`cancel` intents. These tests exercise that contract via
 * TestBed. Keyboard regressions dispatch Arrow/Enter/Space to the rendered
 * CDK listbox and verify that confirming a destination emits its ID.
 *
 */
describe("HierarchyMovePickerComponent", () => {
    let component: HierarchyMovePickerComponent;
    let fixture: ComponentFixture<HierarchyMovePickerComponent>;

    let originalGetComputedStyle: typeof window.getComputedStyle;
    let rectsSpy: jest.SpyInstance;

    beforeAll(() => {
        originalGetComputedStyle = window.getComputedStyle;
        Object.defineProperty(window, "getComputedStyle", {
            configurable: true,
            value: () => ({
                display: "block",
                visibility: "visible",
                getPropertyValue: () => "",
            }),
        });
        rectsSpy = jest
            .spyOn(HTMLElement.prototype, "getClientRects")
            .mockReturnValue([{}] as unknown as DOMRectList);
    });

    afterAll(() => {
        rectsSpy.mockRestore();
        Object.defineProperty(window, "getComputedStyle", {
            configurable: true,
            value: originalGetComputedStyle,
        });
    });

    /** Three distinct destinations spanning different lengths. */
    const destinations: MoveDestination[] = [
        {
            id: "course-root",
            name: "Intro to Security",
            length: LearningObject.Length.COURSE,
            childCount: 2,
            isCurrentParent: false,
        },
        {
            id: "unit-foundations",
            name: "Foundations",
            length: LearningObject.Length.UNIT,
            childCount: 3,
            isCurrentParent: true,
        },
        {
            id: "module-core",
            name: "",
            length: LearningObject.Length.MODULE,
            childCount: 0,
            isCurrentParent: false,
        },
    ];

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HierarchyMovePickerComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HierarchyMovePickerComponent);
        component = fixture.componentInstance;
    });

    /** Helper: set standard inputs and render. */
    function render(
        inputs: Partial<{
            movingNodeName: string;
            unnamedLabel: string;
            destinations: MoveDestination[];
        }> = {},
    ): void {
        component.movingNodeName = inputs.movingNodeName ?? "CIA Triad";
        if (inputs.unnamedLabel !== undefined) {
            component.unnamedLabel = inputs.unnamedLabel;
        }
        component.destinations =
            inputs.destinations !== undefined
                ? inputs.destinations
                : destinations;
        fixture.detectChanges();
    }

    it("creates", () => {
        render();
        expect(component).toBeTruthy();
    });

    describe("moving node name", () => {
        it("renders the moving node name in the heading", () => {
            render({ movingNodeName: "CIA Triad" });

            const heading = fixture.debugElement.query(
                By.css("#move-picker-title"),
            ).nativeElement as HTMLElement;

            expect(heading.textContent).toContain("CIA Triad");
        });

        it("renders the unnamed fallback when movingNodeName is empty", () => {
            render({ movingNodeName: "", unnamedLabel: "Unnamed object" });

            const heading = fixture.debugElement.query(
                By.css("#move-picker-title"),
            ).nativeElement as HTMLElement;

            expect(heading.textContent).toContain("Unnamed object");
            expect(component.displayName).toBe("Unnamed object");
        });
    });

    describe("destination list", () => {
        it("lists all destinations as keyboard-navigable listbox options", () => {
            render();

            const listbox = fixture.debugElement.query(
                By.css('[role="listbox"]'),
            );
            expect(listbox).toBeTruthy();

            const options = fixture.debugElement.queryAll(
                By.css('[role="option"]'),
            );
            expect(options.length).toBe(destinations.length);

            // CDK's cdkOption applies roving tabindex to each option, so the
            // list is operable by keyboard alone (structural assertion — jsdom
            // key simulation is unreliable).
            options.forEach((option) => {
                expect(
                    (option.nativeElement as HTMLElement).hasAttribute(
                        "tabindex",
                    ),
                ).toBe(true);
            });
        });

        it("selecting a destination sets selectedTargetId and marks it selected", () => {
            render();

            component.selectDestination("module-core");
            fixture.detectChanges();

            expect(component.selectedTargetId).toBe("module-core");

            const options = fixture.debugElement.queryAll(
                By.css('[role="option"]'),
            );
            const selected = options.find((o) =>
                (o.nativeElement as HTMLElement).classList.contains(
                    "is-selected",
                ),
            );

            expect(selected).toBeTruthy();
            const selectedCheck = fixture.debugElement.queryAll(
                By.css(".hierarchy-move-picker__option.is-selected"),
            );
            expect(selectedCheck.length).toBe(1);
        });
    });

    it("selects destinations using Arrow keys and Enter/Space", fakeAsync(() => {
        render();
        flush();
        const list = fixture.nativeElement.querySelector(
            '[role="listbox"]',
        ) as HTMLElement;
        list.focus();
        const key = (name: string, keyCode: number) => {
            (document.activeElement ?? list).dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: name,
                    keyCode,
                    bubbles: true,
                }),
            );
            fixture.detectChanges();
        };
        key("Home", 36);
        key("Enter", 13);
        expect(component.selectedTargetId).toBe(destinations[0].id);
        key("ArrowDown", 40);
        key(" ", 32);
        expect(component.selectedTargetId).toBe(destinations[1].id);
        expect(
            fixture.nativeElement.querySelector('[aria-selected="true"]')
                .textContent,
        ).toContain("Foundations");
    }));

    it("shows no destination summary or position control after selecting a parent", () => {
        render();
        component.selectDestination("course-root");
        fixture.detectChanges();
        expect(
            fixture.nativeElement.querySelector(
                ".hierarchy-move-picker__selection",
            ),
        ).toBeNull();
        expect(fixture.nativeElement.querySelector("select")).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain("Move into");
    });

    describe("hierarchy context", () => {
        const hierarchy: HierarchyNode[] = [
            {
                id: "course-root",
                name: "Intro to Security",
                length: LearningObject.Length.COURSE,
                editable: true,
                children: [
                    {
                        id: "unit-foundations",
                        name: "Foundations",
                        length: LearningObject.Length.UNIT,
                        editable: true,
                        children: [
                            {
                                id: "module-core",
                                name: "Core",
                                length: LearningObject.Length.MODULE,
                                editable: true,
                                children: [
                                    {
                                        id: "moving",
                                        name: "CIA Triad",
                                        length: LearningObject.Length
                                            .MICROMODULE,
                                        editable: true,
                                        children: [
                                            {
                                                id: "child",
                                                name: "Confidentiality",
                                                length: LearningObject.Length
                                                    .NANOMODULE,
                                                editable: true,
                                                children: [],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: "linked",
                        name: "Incident Response",
                        length: LearningObject.Length.MODULE,
                        editable: false,
                        linkedRoot: true,
                        children: [],
                    },
                ],
            },
        ];

        function renderHierarchy(): void {
            component.hierarchy = hierarchy;
            component.movingNodeId = "moving";
            render();
        }

        it("shows the full hierarchy in order, with depth and unavailable context", () => {
            renderHierarchy();
            expect(
                component.hierarchyRows.map((row) => [row.id, row.depth]),
            ).toEqual([
                ["course-root", 0],
                ["unit-foundations", 1],
                ["module-core", 2],
                ["moving", 3],
                ["child", 4],
                ["linked", 1],
            ]);
            const options = fixture.nativeElement.querySelectorAll(
                '[role="option"]',
            ) as NodeListOf<HTMLElement>;
            expect(options.length).toBe(6);
            // Foundations has a following sibling; Core is its only child.
            expect(component.hierarchyRows[3].ancestorLines).toEqual([
                true,
                false,
            ]);
            expect(options[3].textContent).toContain("Moving");
            expect(options[5].textContent).toContain("Linked");
            expect(options[3].getAttribute("aria-disabled")).toBe("true");
            expect(options[4].getAttribute("aria-disabled")).toBe("true");
            expect(options[5].getAttribute("aria-disabled")).toBe("true");
            options[3].click();
            options[4].click();
            options[5].click();
            expect(component.selectedTargetId).toBeNull();
            component.selectDestination("moving");
            expect(component.selectedTargetId).toBeNull();
        });

        it("visually identifies available destinations and updates the selected marker", () => {
            renderHierarchy();
            const available = fixture.nativeElement.querySelectorAll(
                ".is-available",
            ) as NodeListOf<HTMLElement>;
            expect(
                Array.from(available).map((row) =>
                    row.getAttribute("data-destination-id"),
                ),
            ).toEqual(["course-root", "unit-foundations", "module-core"]);
            available.forEach((row) =>
                expect(
                    row.querySelector(".hierarchy-move-picker__availability")!
                        .textContent,
                ).toContain("Can move here"),
            );
            const unavailable = fixture.nativeElement.querySelectorAll(
                '[aria-disabled="true"]',
            ) as NodeListOf<HTMLElement>;
            unavailable.forEach((row) =>
                expect(
                    row.querySelector(".hierarchy-move-picker__availability"),
                ).toBeNull(),
            );
            available[1].click();
            fixture.detectChanges();
            expect(
                available[1].querySelector(
                    ".hierarchy-move-picker__availability",
                )!.textContent,
            ).toContain("Selected");
        });

        it("announces ancestry in the selected hierarchy row", () => {
            renderHierarchy();
            expect(fixture.nativeElement.textContent).not.toContain(
                "Currently in",
            );
            const core = fixture.nativeElement.querySelector(
                '[data-destination-id="module-core"]',
            ) as HTMLElement;
            core.click();
            fixture.detectChanges();
            expect(core.getAttribute("aria-label")).toContain(
                "Intro to Security / Foundations",
            );
            expect(core.getAttribute("aria-selected")).toBe("true");
        });

        it("keeps selection when an unavailable row is activated", () => {
            renderHierarchy();
            component.selectDestination("course-root");
            component.selectDestination("linked");
            expect(component.selectedTargetId).toBe("course-root");
        });

        it("keyboard selection skips the moving subtree and linked context", fakeAsync(() => {
            renderHierarchy();
            flush();
            const list = fixture.nativeElement.querySelector(
                '[role="listbox"]',
            ) as HTMLElement;
            list.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: "End",
                    keyCode: 35,
                    bubbles: true,
                }),
            );
            list.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: "Enter",
                    keyCode: 13,
                    bubbles: true,
                }),
            );
            fixture.detectChanges();
            expect(component.selectedTargetId).toBe("module-core");
        }));
    });

    describe("confirm control gating", () => {
        it("disables the confirm button until a selection is made", () => {
            render();

            const confirmButton = fixture.debugElement.query(
                By.css(".hierarchy-move-picker__button--primary"),
            ).nativeElement as HTMLButtonElement;

            expect(confirmButton.disabled).toBe(true);
            expect(component.canConfirm).toBe(false);

            component.selectDestination("course-root");
            fixture.detectChanges();

            expect(component.canConfirm).toBe(true);
            expect(confirmButton.disabled).toBe(false);
        });
    });

    describe("empty state", () => {
        it("renders a status empty-state and no confirm button when there are no destinations", () => {
            render({ destinations: [] });

            const emptyState = fixture.debugElement.query(
                By.css('[role="status"]'),
            );
            expect(emptyState).toBeTruthy();

            const confirmButton = fixture.debugElement.query(
                By.css(".hierarchy-move-picker__button--primary"),
            );
            expect(confirmButton).toBeNull();

            // The listbox should not render either.
            const listbox = fixture.debugElement.query(
                By.css('[role="listbox"]'),
            );
            expect(listbox).toBeNull();

            // Cancel is still always available.
            const cancelButton = fixture.debugElement.query(
                By.css(".hierarchy-move-picker__button--ghost"),
            );
            expect(cancelButton).toBeTruthy();
        });
    });

    it("changes the selected destination and clears a previous error", () => {
        render();
        component.selectDestination("course-root");
        component.errorMessage = "That move could not be completed.";
        component.selectDestination("unit-foundations");
        expect(component.selectedTargetId).toBe("unit-foundations");
        expect(component.errorMessage).toBeNull();
    });

    describe("confirm emission", () => {
        it("emits only the selected target ID", () => {
            render();
            const emitted: Array<{ targetId: string }> = [];
            component.confirm.subscribe((payload) => emitted.push(payload));

            component.selectDestination("course-root");
            component.onConfirm();

            expect(emitted).toEqual([{ targetId: "course-root" }]);
        });

        it("does not emit when no destination is selected", () => {
            render();
            const emitted: Array<{ targetId: string }> = [];
            component.confirm.subscribe((payload) => emitted.push(payload));

            component.onConfirm();

            expect(emitted.length).toBe(0);
        });
    });

    describe("cancel emission", () => {
        it("emits cancel when the cancel control is activated", () => {
            render();
            let cancelled = false;
            component.cancel.subscribe(() => (cancelled = true));

            const cancelButton = fixture.debugElement.query(
                By.css(".hierarchy-move-picker__button--ghost"),
            ).nativeElement as HTMLButtonElement;
            cancelButton.click();

            expect(cancelled).toBe(true);
        });
    });
});
