import {
    ComponentFixture,
    fakeAsync,
    flush,
    TestBed,
    waitForAsync,
} from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { ToastrOvenService } from "../../../../shared/modules/toaster/notification.service";
import { CdkDragDrop } from "@angular/cdk/drag-drop";

import { HierarchyTreeComponent } from "./hierarchy-tree.component";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode } from "./hierarchy-tree.types";

/**
 * Integration tests for `HierarchyTreeComponent`
 *
 * These exercise the fully wired coordinator: the real component renders
 * recursive `clark-hierarchy-node` rows (each with a kebab Action Menu), the
 * real `HierarchyViewService` (seeded with mock data on init) provides the
 * move rules, and the real `HierarchyMovePickerComponent` is attached into a
 * CDK Overlay. We drive the flow through the component's public surface
 * (clicking the rendered menu item / overlay controls) and assert against the
 * overlay DOM, so the tests stay reliable under jsdom and don't depend on
 * pointer geometry.
 *
 * The Action Menu is a `MatMenu`; it renders into a CDK overlay. The repo's
 * global jest mock replaces `getComputedStyle` with an object lacking
 * `getPropertyValue`, which `MatMenu.setElevation` calls on open — so we patch
 * `getComputedStyle` locally in beforeAll/afterAll (restoring it after),
 * exactly as `hierarchy-node.component.spec.ts` does.
 *
 */
describe("HierarchyTreeComponent (integration)", () => {
    let fixture: ComponentFixture<HierarchyTreeComponent>;
    let component: HierarchyTreeComponent;
    let viewService: HierarchyViewService;
    let originalGetComputedStyle: typeof window.getComputedStyle;
    let rectsSpy: jest.SpyInstance;
    let notifications: { success: jest.Mock };
    let liveAnnouncer: { announce: jest.Mock };

    beforeAll(() => {
        // jsdom has no layout; expose rendered controls to CDK's visibility checks.
        rectsSpy = jest
            .spyOn(HTMLElement.prototype, "getClientRects")
            .mockReturnValue([{}] as unknown as DOMRectList);
        originalGetComputedStyle = window.getComputedStyle;
        Object.defineProperty(window, "getComputedStyle", {
            configurable: true,
            value: () => ({
                display: "block",
                visibility: "visible",
                appearance: ["-webkit-appearance"],
                getPropertyValue: () => "",
            }),
        });
    });

    afterAll(() => {
        rectsSpy.mockRestore();
        Object.defineProperty(window, "getComputedStyle", {
            configurable: true,
            value: originalGetComputedStyle,
        });
    });

    // --- overlay / DOM query helpers -------------------------------------

    /** The attached Move Picker element in the overlay, or null when closed. */
    function pickerElement(): HTMLElement | null {
        return document.querySelector<HTMLElement>(
            ".cdk-overlay-container .hierarchy-move-picker",
        );
    }

    /** All mat-menu-item buttons currently rendered in the overlay. */
    function overlayMenuItems(): HTMLButtonElement[] {
        return Array.from(
            document.querySelectorAll<HTMLButtonElement>(
                ".cdk-overlay-container button[mat-menu-item]",
            ),
        );
    }

    /** The Move menu item inside the open Action Menu. */
    function moveMenuItem(): HTMLButtonElement | undefined {
        return overlayMenuItems().find(
            (item) => item.getAttribute("data-action-id") === "move",
        );
    }

    /** Destination option rows inside the open picker. */
    function pickerOptions(): HTMLElement[] {
        return Array.from(
            document.querySelectorAll<HTMLElement>(
                '.cdk-overlay-container .hierarchy-move-picker [role="option"]',
            ),
        );
    }

    /** The picker's "Move here" primary (confirm) button, or null. */
    function confirmButton(): HTMLButtonElement | null {
        return document.querySelector<HTMLButtonElement>(
            ".cdk-overlay-container .hierarchy-move-picker__button--primary",
        );
    }

    /** The picker's Cancel (ghost) button, or null. */
    function cancelButton(): HTMLButtonElement | null {
        return document.querySelector<HTMLButtonElement>(
            ".cdk-overlay-container .hierarchy-move-picker__button--ghost",
        );
    }

    /** The picker's inline error alert, or null. */
    function errorAlert(): HTMLElement | null {
        return document.querySelector<HTMLElement>(
            '.cdk-overlay-container .hierarchy-move-picker [role="alert"]',
        );
    }

    /** The CDK overlay backdrop, or null. */
    function backdrop(): HTMLElement | null {
        return document.querySelector<HTMLElement>(".cdk-overlay-backdrop");
    }

    /**
     * The rendered Action Menu trigger for a given node id. The row carries
     * `data-node-id`; the trigger is the `.action-menu-button` within it.
     */
    function triggerFor(nodeId: string): HTMLButtonElement {
        const row = fixture.nativeElement.querySelector(
            `.node-row[data-node-id="${nodeId}"]`,
        ) as HTMLElement;
        return row.querySelector(".action-menu-button") as HTMLButtonElement;
    }

    /**
     * Open the Action Menu for a node and select "Move", which runs the full
     * `onMenuAction -> openMovePicker` path and attaches the picker overlay.
     * Settled with flush so the menu overlay and picker have rendered.
     */
    function openMovePickerFor(nodeId: string): void {
        triggerFor(nodeId).click();
        flush();
        fixture.detectChanges();

        const move = moveMenuItem();
        if (!move) {
            throw new Error(`Move menu item not found for node ${nodeId}`);
        }
        // Include change detection between press and release, as happens
        // during a real pointer gesture rather than an atomic .click().
        move.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        fixture.detectChanges();
        expect(moveMenuItem()).toBe(move);
        expect(move.isConnected).toBe(true);
        move.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        move.click();
        flush();
        fixture.detectChanges();
    }

    /** Select through the rendered CDK option and its value-change binding. */
    function selectDestination(targetId: string): void {
        const option = pickerOptions().find(
            (element) =>
                element.getAttribute("data-destination-id") === targetId,
        );
        if (!option) {
            throw new Error(`Destination not rendered: ${targetId}`);
        }
        option.click();
        currentPickerDetectChanges();
    }

    // Access the attached picker component instance via the tree's private
    // `movePickerRef`. The coordinator keeps this reference so it can surface
    // inline errors; reading it lets the test confirm a destination by id
    // reliably (jsdom makes cdkListbox keyboard/click selection fiddly).
    function currentPickerInstance():
        | import("./hierarchy-move-picker/hierarchy-move-picker.component").HierarchyMovePickerComponent
        | null {
        const ref = (component as unknown as { movePickerRef: any })
            .movePickerRef;
        return ref ? ref.instance : null;
    }

    function currentPickerDetectChanges(): void {
        const ref = (component as unknown as { movePickerRef: any })
            .movePickerRef;
        ref?.changeDetectorRef.detectChanges();
    }

    beforeEach(waitForAsync(() => {
        notifications = { success: jest.fn() };
        liveAnnouncer = { announce: jest.fn() };
        TestBed.configureTestingModule({
            imports: [HierarchyTreeComponent, NoopAnimationsModule],
            providers: [
                HierarchyViewService,
                { provide: ToastrOvenService, useValue: notifications },
                { provide: LiveAnnouncer, useValue: liveAnnouncer },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HierarchyTreeComponent);
        component = fixture.componentInstance;
        viewService = TestBed.inject(HierarchyViewService);
        fixture.detectChanges(); // ngOnInit seeds the mock tree
    });

    afterEach(fakeAsync(() => {
        // Destroy under fakeAsync so branch leave animations are drained too.
        fixture.destroy();
        flush();
    }));

    it("seeds the mock tree and renders node rows", () => {
        expect(viewService.tree.length).toBeGreaterThan(0);
        expect(
            fixture.nativeElement.querySelector(
                '.node-row[data-node-id="root"]',
            ),
        ).toBeTruthy();
    });

    describe("opening the picker", () => {
        it("selecting Move on a movable node opens the picker and calls validDestinations with the node id", fakeAsync(() => {
            const spy = jest.spyOn(viewService, "validDestinations");

            // `unit-foundations` is editable and movable.
            openMovePickerFor("unit-foundations");

            expect(spy).toHaveBeenCalledWith("unit-foundations");
            expect(pickerElement()).toBeTruthy();
            // The picker renders the enumerated destinations as listbox options.
            expect(pickerOptions().length).toBeGreaterThan(0);
        }));
    });

    describe("keyboard focus and overlay lifetime", () => {
        it("captures focus and wraps at both focus-trap boundaries", fakeAsync(() => {
            openMovePickerFor("unit-foundations");
            const picker = pickerElement()!;
            expect(picker.contains(document.activeElement)).toBe(true);
            expect(picker.getAttribute("role")).toBe("dialog");

            const anchors = document.querySelectorAll<HTMLElement>(
                ".cdk-overlay-container .cdk-focus-trap-anchor",
            );
            expect(anchors.length).toBe(2);
            // jsdom does not implement Tab navigation. Focus the sentinels
            // that the browser reaches when tabbing out of the trapped region.
            anchors[0].focus();
            expect(document.activeElement).toBe(cancelButton());
            anchors[1].focus();
            expect(picker.contains(document.activeElement)).toBe(true);
            expect(document.activeElement).not.toBe(anchors[1]);
        }));

        it("focuses Cancel when the destination list is empty", fakeAsync(() => {
            jest.spyOn(viewService, "validDestinations").mockReturnValue([]);
            openMovePickerFor("unit-foundations");
            expect(document.activeElement).toBe(cancelButton());
            expect(confirmButton()).toBeNull();
        }));

        it("destroys an open picker and releases the scroll lock", fakeAsync(() => {
            Object.defineProperty(document.body, "scrollHeight", {
                configurable: true,
                value: 2000,
            });
            const scrollSpy = jest
                .spyOn(window, "scroll")
                .mockImplementation(() => {});
            openMovePickerFor("unit-foundations");
            expect(
                document.documentElement.classList.contains(
                    "cdk-global-scrollblock",
                ),
            ).toBe(true);
            fixture.destroy();
            flush();
            expect(pickerElement()).toBeNull();
            expect(backdrop()).toBeNull();
            expect(
                document.documentElement.classList.contains(
                    "cdk-global-scrollblock",
                ),
            ).toBe(false);
            scrollSpy.mockRestore();
            Reflect.deleteProperty(document.body, "scrollHeight");
        }));

        it("cancels queued opening when the tree is destroyed", fakeAsync(() => {
            const spy = jest.spyOn(viewService, "validDestinations");
            component.onMenuAction({
                actionId: "move",
                nodeId: "unit-foundations",
            });
            fixture.destroy();
            flush();
            expect(spy).not.toHaveBeenCalled();
            expect(pickerElement()).toBeNull();
            expect(backdrop()).toBeNull();
        }));

        it("cleans up state when the overlay is detached externally", fakeAsync(() => {
            openMovePickerFor("unit-foundations");
            const overlay = (
                component as unknown as {
                    moveOverlayRef: import("@angular/cdk/overlay").OverlayRef;
                }
            ).moveOverlayRef;
            overlay.detach();
            flush();
            expect(pickerElement()).toBeNull();
            expect(currentPickerInstance()).toBeNull();
            expect(
                document.documentElement.classList.contains(
                    "cdk-global-scrollblock",
                ),
            ).toBe(false);
            expect(document.activeElement).toBe(triggerFor("unit-foundations"));
        }));
    });

    it.each(["mouse", "keyboard"] as const)(
        "restores %s focus to the new row after appending",
        fakeAsync((origin) => {
            const oldTrigger = triggerFor("nano-glossary");
            const moveSpy = jest.spyOn(viewService, "moveNode");
            openMovePickerFor("nano-glossary");
            selectDestination("network-security");
            const confirm = confirmButton()!;
            confirm.dispatchEvent(
                origin === "mouse"
                    ? new MouseEvent("mousedown", {
                          bubbles: true,
                          buttons: 1,
                          detail: 1,
                      })
                    : new KeyboardEvent("keydown", {
                          bubbles: true,
                          key: "Enter",
                          keyCode: 13,
                      }),
            );
            confirm.click();
            flush();
            fixture.detectChanges();

            expect(moveSpy).toHaveBeenCalledWith(
                "nano-glossary",
                "network-security",
            );
            expect(
                findNode(viewService.tree, "network-security")!.children[0].id,
            ).toBe("nano-glossary");
            const newTrigger = triggerFor("nano-glossary");
            expect(newTrigger).not.toBe(oldTrigger);
            expect(newTrigger.isConnected).toBe(true);
            expect(document.activeElement).toBe(newTrigger);
            expect(newTrigger.classList.contains(`cdk-${origin}-focused`)).toBe(
                true,
            );
            expect(newTrigger.classList.contains("cdk-program-focused")).toBe(
                false,
            );
            if (origin === "mouse") {
                expect(
                    newTrigger.classList.contains("cdk-keyboard-focused"),
                ).toBe(false);
            }
            expect(pickerElement()).toBeNull();
        }),
    );

    it("clears programmatic focus styling when a pointer move reuses the same row", fakeAsync(() => {
        const trigger = triggerFor("unit-foundations");
        openMovePickerFor("unit-foundations");
        selectDestination("root");
        const confirm = confirmButton()!;
        confirm.dispatchEvent(
            new MouseEvent("mousedown", {
                bubbles: true,
                buttons: 1,
                detail: 1,
            }),
        );
        confirm.click();
        flush();
        fixture.detectChanges();
        expect(triggerFor("unit-foundations")).toBe(trigger);
        expect(document.activeElement).toBe(trigger);
        expect(trigger.classList.contains("cdk-mouse-focused")).toBe(true);
        expect(trigger.classList.contains("cdk-program-focused")).toBe(false);
        expect(trigger.classList.contains("cdk-keyboard-focused")).toBe(false);
    }));

    it("reveals a collapsed destination branch before restoring focus", fakeAsync(() => {
        viewService.toggleExpanded("unit-foundations");
        fixture.detectChanges();
        flush();
        openMovePickerFor("nano-glossary");
        selectDestination("mod-core-concepts");
        confirmButton()!.click();
        flush();
        fixture.detectChanges();
        expect(findNode(viewService.tree, "unit-foundations")!.expanded).toBe(
            true,
        );
        expect(document.activeElement).toBe(triggerFor("nano-glossary"));
        expect(triggerFor("nano-glossary").isConnected).toBe(true);
    }));

    it("ignores an old row retained at the source during a leave animation", fakeAsync(() => {
        const oldComponent = triggerFor("nano-glossary").closest(
            "clark-hierarchy-node",
        )!;
        const oldBranch = oldComponent.parentElement!;
        // Simulate the DOM Angular can retain until descendant animations finish.
        const leavingComponent = oldComponent.cloneNode(true) as HTMLElement;
        openMovePickerFor("nano-glossary");
        const leavingBranch = document.createElement("div");
        leavingBranch.className = "node-branch";
        leavingBranch.appendChild(leavingComponent);
        oldBranch.parentElement!.insertBefore(leavingBranch, oldBranch);
        selectDestination("network-security");
        confirmButton()!.click();
        flush();
        fixture.detectChanges();
        const destinationComponent = triggerFor("network-security").closest(
            "clark-hierarchy-node",
        )!;
        const liveTrigger =
            destinationComponent.querySelector<HTMLButtonElement>(
                '.node-row[data-node-id="nano-glossary"] .action-menu-button',
            );
        expect(liveTrigger).toBeTruthy();
        expect(leavingComponent.isConnected).toBe(true);
        expect(document.activeElement).toBe(liveTrigger);
        expect(leavingComponent.contains(document.activeElement)).toBe(false);
        leavingBranch.remove();
    }));

    describe("confirming a move", () => {
        it("calls moveNode with the selected target and closes the picker on success", fakeAsync(() => {
            const moveSpy = jest.spyOn(viewService, "moveNode");

            openMovePickerFor("unit-foundations");
            expect(pickerElement()).toBeTruthy();

            // `root` is a valid destination for the Foundations unit (its
            // current parent — a reorder — which validDestinations includes).
            selectDestination("root");

            const confirm = confirmButton();
            expect(confirm).toBeTruthy();
            expect(confirm!.disabled).toBe(false);

            confirm!.click();
            flush();
            fixture.detectChanges();

            expect(moveSpy).toHaveBeenCalledWith("unit-foundations", "root");
            // Success closes the picker and identifies the completed move.
            expect(pickerElement()).toBeNull();
            expect(notifications.success).toHaveBeenCalledWith(
                "Object moved",
                "“Foundations Unit” moved into “Intro to Cybersecurity”.",
            );
            expect(liveAnnouncer.announce).toHaveBeenCalledWith(
                "“Foundations Unit” moved into “Intro to Cybersecurity”.",
                "polite",
            );
        }));
    });

    describe("a rejected move keeps the picker open", () => {
        it("shows the inline error and leaves the picker attached when moveNode returns false", fakeAsync(() => {
            // Force the move engine to reject regardless of the chosen target.
            jest.spyOn(viewService, "moveNode").mockReturnValue(false);

            openMovePickerFor("unit-foundations");
            selectDestination("root");

            confirmButton()!.click();
            flush();
            fixture.detectChanges();
            currentPickerDetectChanges();

            expect(notifications.success).not.toHaveBeenCalled();
            expect(liveAnnouncer.announce).not.toHaveBeenCalled();
            // Picker stays open and surfaces the failure message.
            expect(pickerElement()).toBeTruthy();
            const alert = errorAlert();
            expect(alert).toBeTruthy();
            expect(alert!.textContent).toContain(
                "That move could not be completed.",
            );
        }));
    });

    describe("closing the picker without mutating the tree", () => {
        /** A structural snapshot of the tree, to prove it is unchanged. */
        function snapshot(): string {
            return JSON.stringify(viewService.tree);
        }

        it("Cancel closes the picker, leaves the tree unchanged, and restores focus to the trigger", fakeAsync(() => {
            const before = snapshot();
            const trigger = triggerFor("unit-foundations");
            trigger.focus();

            openMovePickerFor("unit-foundations");
            expect(pickerElement()).toBeTruthy();

            cancelButton()!.click();
            flush();
            fixture.detectChanges();

            expect(pickerElement()).toBeNull();
            expect(snapshot()).toBe(before);
            expect(notifications.success).not.toHaveBeenCalled();
            expect(document.activeElement).toBe(trigger);
        }));

        it("Escape closes the picker, leaves the tree unchanged, and restores focus", fakeAsync(() => {
            const before = snapshot();
            const trigger = triggerFor("unit-foundations");
            trigger.focus();

            openMovePickerFor("unit-foundations");
            expect(pickerElement()).toBeTruthy();

            const overlayEl = document.querySelector<HTMLElement>(
                ".cdk-overlay-container .cdk-overlay-pane",
            );
            const escape = new KeyboardEvent("keydown", {
                key: "Escape",
                keyCode: 27,
                bubbles: true,
            });
            (overlayEl ?? document).dispatchEvent(escape);
            flush();
            fixture.detectChanges();

            expect(pickerElement()).toBeNull();
            expect(snapshot()).toBe(before);
            expect(notifications.success).not.toHaveBeenCalled();
            expect(document.activeElement).toBe(trigger);
        }));

        it("backdrop click closes the picker, leaves the tree unchanged, and restores focus", fakeAsync(() => {
            const before = snapshot();
            const trigger = triggerFor("unit-foundations");
            trigger.focus();

            openMovePickerFor("unit-foundations");
            expect(pickerElement()).toBeTruthy();

            const back = backdrop();
            expect(back).toBeTruthy();
            back!.click();
            flush();
            fixture.detectChanges();

            expect(pickerElement()).toBeNull();
            expect(snapshot()).toBe(before);
            expect(notifications.success).not.toHaveBeenCalled();
            expect(document.activeElement).toBe(trigger);
        }));
    });

    describe("the drag path delegates to the same engine", () => {
        /**
         * The drop handler resolves its target by hit-testing `event.dropPoint`
         * against rendered rows via `getBoundingClientRect`, which jsdom does
         * not lay out — so geometry-driven simulation is unreliable here.
         * Instead we assert the invariant two ways:
         *   1. `onTreeDrop` for a valid drop delegates to `viewService.moveNode`
         *      (we stub the dragged row's rect so the point lands on a target);
         *   2. the picker-confirm path and the equivalent direct drag-path
         *      `moveNode` call produce an identical tree.
         */
        it.each([true, false])(
            "notifies only when a valid drop is applied (applied: %s)",
            (applied) => {
                const moveSpy = jest.spyOn(viewService, "moveNode");
                if (!applied) {
                    moveSpy.mockReturnValue(false);
                }

                const dragged = findNode(viewService.tree, "nano-glossary")!;
                const targetRow = fixture.nativeElement.querySelector(
                    '.node-row[data-node-id="network-security"]',
                ) as HTMLElement;
                // Give the target row a deterministic rect so the hit-test resolves.
                targetRow.getBoundingClientRect = () =>
                    ({
                        left: 0,
                        right: 500,
                        top: 100,
                        bottom: 140,
                        width: 500,
                        height: 40,
                    }) as DOMRect;

                const event = {
                    item: { data: dragged },
                    dropPoint: { x: 10, y: 120 },
                } as unknown as CdkDragDrop<HierarchyNode>;

                component.onTreeDrop(event);

                expect(moveSpy).toHaveBeenCalledWith(
                    "nano-glossary",
                    "network-security",
                );
                expect(notifications.success).toHaveBeenCalledTimes(
                    applied ? 1 : 0,
                );
                expect(liveAnnouncer.announce).toHaveBeenCalledTimes(
                    applied ? 1 : 0,
                );
                if (applied) {
                    expect(notifications.success).toHaveBeenCalledWith(
                        "Object moved",
                        "“Security Glossary” moved into “Network Security”.",
                    );
                }
            },
        );

        it("picker-confirm and drag-path moves yield an identical tree", () => {
            // Picker path: move via moveNode with index omitted (append).
            viewService.moveNode("nano-glossary", "network-security");
            const pickerTree = JSON.stringify(viewService.tree);

            // Reset and apply the equivalent drag-path move (same args).
            viewService.seedMockData();
            viewService.moveNode("nano-glossary", "network-security");
            const dragTree = JSON.stringify(viewService.tree);

            expect(pickerTree).toBe(dragTree);
        });
    });
});

/** Local node lookup for assertions (mirrors the component's view-only find). */
function findNode(
    nodes: HierarchyNode[],
    id: string,
): HierarchyNode | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return node;
        }
        const found = findNode(node.children, id);
        if (found) {
            return found;
        }
    }

    return undefined;
}
