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
import { HierarchyLoaderService } from "./hierarchy-loader.service";
import { HierarchyEditService } from "./hierarchy-edit.service";
import { LearningObjectService } from "../../../../core/learning-object-module/learning-object/learning-object.service";
import { LearningObject } from "@entity";
import { of } from "rxjs";
import { HierarchyNode } from "./hierarchy-tree.types";

// The real service imports via the bare "app/..." path, which this repo's Jest
// config cannot resolve. Only the DI token is needed here.
jest.mock(
    "../../../../core/learning-object-module/learning-object/learning-object.service",
    () => ({ LearningObjectService: class LearningObjectService {} }),
);

/**
 * Integration tests for `HierarchyTreeComponent`
 *
 * These exercise the fully wired coordinator: the real component renders
 * recursive `clark-hierarchy-node` rows (each with a kebab Action Menu), the
 * real `HierarchyViewService` (populated by a stubbed loader on init) provides the
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
    let notifications: { success: jest.Mock; error: jest.Mock };
    let liveAnnouncer: { announce: jest.Mock };
    let setChildren: jest.Mock;
    let loaderRetry: jest.Mock;

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
        notifications = { success: jest.fn(), error: jest.fn() };
        liveAnnouncer = { announce: jest.fn() };
        setChildren = jest.fn().mockResolvedValue(undefined);
        loaderRetry = jest.fn();
        TestBed.configureTestingModule({
            imports: [HierarchyTreeComponent, NoopAnimationsModule],
            providers: [
                HierarchyViewService,
                HierarchyEditService,
                // The API layer is stubbed; persistence rules are covered by
                // hierarchy-edit.service.spec.ts.
                {
                    provide: LearningObjectService,
                    useValue: { setChildren },
                },
                {
                    // Loading is covered by hierarchy-loader.service.spec.ts;
                    // here the loader publishes a fixed tree so the move
                    // flows can be exercised.
                    provide: HierarchyLoaderService,
                    useFactory: (view: HierarchyViewService) => ({
                        status$: of("ready"),
                        load: () => view.setTree(buildSpecTree()),
                        retry: loaderRetry,
                    }),
                    deps: [HierarchyViewService],
                },
                { provide: ToastrOvenService, useValue: notifications },
                { provide: LiveAnnouncer, useValue: liveAnnouncer },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HierarchyTreeComponent);
        component = fixture.componentInstance;
        viewService = TestBed.inject(HierarchyViewService);
        component.learningObject = {
            id: "root",
            name: "Root",
        } as LearningObject;
        fixture.detectChanges(); // ngOnInit loads the (stubbed) tree
    });

    afterEach(fakeAsync(() => {
        // Destroy under fakeAsync so branch leave animations are drained too.
        fixture.destroy();
        flush();
    }));

    it("loads the tree and renders node rows", () => {
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
        it("saves the move, then closes the picker and announces it", fakeAsync(() => {
            const moveSpy = jest.spyOn(viewService, "moveNode");

            openMovePickerFor("nano-glossary");
            expect(pickerElement()).toBeTruthy();
            selectDestination("network-security");

            const confirm = confirmButton();
            expect(confirm).toBeTruthy();
            expect(confirm!.disabled).toBe(false);

            confirm!.click();
            // Applied locally at once, but nothing is announced until saved.
            expect(moveSpy).toHaveBeenCalledWith(
                "nano-glossary",
                "network-security",
            );
            expect(notifications.success).not.toHaveBeenCalled();
            flush();
            fixture.detectChanges();

            // Add to the new parent first, then remove from the old one.
            expect(setChildren.mock.calls).toEqual([
                ["network-security", ["nano-glossary"], false],
                ["root", ["nano-glossary"], true],
            ]);
            expect(pickerElement()).toBeNull();
            expect(notifications.success).toHaveBeenCalledWith(
                "Object moved",
                "“Security Glossary” moved under “Network Security”.",
            );
            expect(liveAnnouncer.announce).toHaveBeenCalledWith(
                "“Security Glossary” moved under “Network Security”.",
                "polite",
            );
            expect(loaderRetry).not.toHaveBeenCalled();
        }));

        it("lists the current parent but does not let it be chosen", fakeAsync(() => {
            openMovePickerFor("unit-foundations");

            const current = pickerOptions().find(
                (option) =>
                    option.getAttribute("data-destination-id") === "root",
            )!;
            // Order cannot be saved yet, so "move within the same parent" is out.
            expect(current.textContent).toContain("Current parent");
            expect(current.getAttribute("aria-disabled")).toBe("true");
            current.click();
            currentPickerDetectChanges();
            expect(confirmButton()).toBeNull();
        }));
    });

    describe("a move that cannot be completed keeps the picker open", () => {
        it("shows the inline error and leaves the picker attached when the move engine refuses", fakeAsync(() => {
            // Force the move engine to reject regardless of the chosen target.
            jest.spyOn(viewService, "moveNode").mockReturnValue(false);

            openMovePickerFor("nano-glossary");
            selectDestination("network-security");

            confirmButton()!.click();
            flush();
            fixture.detectChanges();
            currentPickerDetectChanges();

            expect(setChildren).not.toHaveBeenCalled();
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

        it("rolls the tree back and keeps the picker open when the API fails", fakeAsync(() => {
            const before = JSON.stringify(viewService.tree);
            setChildren.mockRejectedValue(new Error("boom"));

            openMovePickerFor("nano-glossary");
            selectDestination("network-security");
            confirmButton()!.click();
            flush();
            fixture.detectChanges();
            currentPickerDetectChanges();

            expect(JSON.stringify(viewService.tree)).toBe(before);
            expect(notifications.success).not.toHaveBeenCalled();
            expect(pickerElement()).toBeTruthy();
            expect(errorAlert()!.textContent).toContain(
                "could not be saved, so nothing changed",
            );
        }));

        it("closes the picker, toasts, and reloads when a half-saved move cannot be undone", fakeAsync(() => {
            // Added to the new parent, then removing from the old parent and
            // the compensating removal both fail.
            setChildren
                .mockResolvedValueOnce(undefined)
                .mockRejectedValue(new Error("boom"));

            openMovePickerFor("nano-glossary");
            selectDestination("network-security");
            confirmButton()!.click();
            flush();
            fixture.detectChanges();

            expect(pickerElement()).toBeNull();
            expect(loaderRetry).toHaveBeenCalledTimes(1);
            expect(notifications.error).toHaveBeenCalledWith(
                "Move failed",
                expect.stringContaining("reloaded"),
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
         * not lay out, so the target row gets a stubbed rect and the drop event
         * is built by hand.
         */
        function dropOnto(draggedId: string, targetId: string): void {
            const dragged = findNode(viewService.tree, draggedId)!;
            const targetRow = fixture.nativeElement.querySelector(
                `.node-row[data-node-id="${targetId}"]`,
            ) as HTMLElement;
            targetRow.getBoundingClientRect = () =>
                ({
                    left: 0,
                    right: 500,
                    top: 100,
                    bottom: 140,
                    width: 500,
                    height: 40,
                }) as DOMRect;

            component.onTreeDrop({
                item: { data: dragged },
                dropPoint: { x: 10, y: 120 },
            } as unknown as CdkDragDrop<HierarchyNode>);
        }

        it("saves a valid drop and reports it only after the save", fakeAsync(() => {
            const moveSpy = jest.spyOn(viewService, "moveNode");

            dropOnto("nano-glossary", "network-security");
            expect(moveSpy).toHaveBeenCalledWith(
                "nano-glossary",
                "network-security",
            );
            expect(notifications.success).not.toHaveBeenCalled();
            flush();

            expect(setChildren.mock.calls).toEqual([
                ["network-security", ["nano-glossary"], false],
                ["root", ["nano-glossary"], true],
            ]);
            expect(notifications.success).toHaveBeenCalledTimes(1);
            expect(notifications.success).toHaveBeenCalledWith(
                "Object moved",
                "“Security Glossary” moved under “Network Security”.",
            );
            expect(liveAnnouncer.announce).toHaveBeenCalledTimes(1);
            expect(
                findNode(viewService.tree, "network-security")!.children.map(
                    (c) => c.id,
                ),
            ).toEqual(["nano-glossary"]);
        }));

        it("ignores a drop the move engine refuses, with no request and no toast", fakeAsync(() => {
            jest.spyOn(viewService, "moveNode").mockReturnValue(false);

            dropOnto("nano-glossary", "network-security");
            flush();

            expect(setChildren).not.toHaveBeenCalled();
            expect(notifications.success).not.toHaveBeenCalled();
            expect(notifications.error).not.toHaveBeenCalled();
        }));

        it("rejects a drop into a linked/read-only subtree with no request", fakeAsync(() => {
            const before = JSON.stringify(viewService.tree);

            dropOnto("nano-glossary", "micro-detection");
            flush();

            expect(setChildren).not.toHaveBeenCalled();
            expect(JSON.stringify(viewService.tree)).toBe(before);
        }));

        it("rejects a drop onto a parent that is too short", fakeAsync(() => {
            const before = JSON.stringify(viewService.tree);

            // A module cannot go inside a micromodule.
            dropOnto("incident-response", "network-security");
            flush();

            expect(setChildren).not.toHaveBeenCalled();
            expect(JSON.stringify(viewService.tree)).toBe(before);
        }));

        it("rejects dropping a unit into its own descendant", fakeAsync(() => {
            const before = JSON.stringify(viewService.tree);

            dropOnto("unit-foundations", "mod-core-concepts");
            flush();

            expect(setChildren).not.toHaveBeenCalled();
            expect(JSON.stringify(viewService.tree)).toBe(before);
        }));

        it("rolls the tree back and shows an error when the save fails", fakeAsync(() => {
            const before = JSON.stringify(viewService.tree);
            setChildren.mockRejectedValue(new Error("boom"));

            dropOnto("nano-glossary", "network-security");
            // Applied optimistically while the request is in flight.
            expect(
                findNode(viewService.tree, "network-security")!.children,
            ).toHaveLength(1);
            flush();

            expect(JSON.stringify(viewService.tree)).toBe(before);
            expect(notifications.success).not.toHaveBeenCalled();
            expect(notifications.error).toHaveBeenCalledWith(
                "Move failed",
                expect.stringContaining("left as it was"),
            );
            expect(loaderRetry).not.toHaveBeenCalled();
        }));

        it("refuses a second drop while the first is still saving", fakeAsync(() => {
            let resolveFirst!: () => void;
            setChildren.mockReturnValueOnce(
                new Promise<void>((resolve) => (resolveFirst = resolve)),
            );

            dropOnto("nano-glossary", "network-security");
            expect(component.canMove("nano-glossary")).toBe(false);
            dropOnto("nano-glossary", "root");
            expect(setChildren).toHaveBeenCalledTimes(1);

            resolveFirst();
            flush();
            expect(component.canMove("nano-glossary")).toBe(true);
        }));

        it("picker-confirm and drag-path moves yield an identical tree", () => {
            // Picker path: move via moveNode with index omitted (append).
            viewService.moveNode("nano-glossary", "network-security");
            const pickerTree = JSON.stringify(viewService.tree);

            // Reset and apply the equivalent drag-path move (same args).
            viewService.setTree(buildSpecTree());
            viewService.moveNode("nano-glossary", "network-security");
            const dragTree = JSON.stringify(viewService.tree);

            expect(pickerTree).toBe(dragTree);
        });
    });

    describe("removing a child", () => {
        /** Select "Remove from Hierarchy" in the open Action Menu of `nodeId`. */
        function removeViaMenu(nodeId: string): void {
            triggerFor(nodeId).click();
            flush();
            fixture.detectChanges();
            const remove = overlayMenuItems().find(
                (item) => item.getAttribute("data-action-id") === "remove",
            );
            if (!remove) {
                throw new Error(`Remove menu item not found for ${nodeId}`);
            }
            remove.click();
            flush();
            fixture.detectChanges();
        }

        it("unlinks the child from its parent, keeps the object, and says so", fakeAsync(() => {
            removeViaMenu("nano-glossary");

            expect(setChildren.mock.calls).toEqual([
                ["root", ["nano-glossary"], true],
            ]);
            expect(findNode(viewService.tree, "nano-glossary")).toBeUndefined();
            expect(notifications.success).toHaveBeenCalledWith(
                "Object removed",
                "“Security Glossary” was removed from “Intro to Cybersecurity”. It is still in your library.",
            );
            expect(liveAnnouncer.announce).toHaveBeenCalledWith(
                expect.stringContaining("still in your library"),
                "polite",
            );
        }));

        it("moves focus to the parent's menu button once the row is gone", fakeAsync(() => {
            removeViaMenu("nano-glossary");

            expect(document.activeElement).toBe(triggerFor("root"));
        }));

        it("removes a linked root as a whole", fakeAsync(() => {
            removeViaMenu("incident-response");

            expect(setChildren.mock.calls).toEqual([
                ["root", ["incident-response"], true],
            ]);
            expect(
                findNode(viewService.tree, "incident-response"),
            ).toBeUndefined();
            expect(
                findNode(viewService.tree, "micro-detection"),
            ).toBeUndefined();
        }));

        it("restores the tree and shows an error when the save fails", fakeAsync(() => {
            const before = JSON.stringify(viewService.tree);
            setChildren.mockRejectedValue(new Error("boom"));

            removeViaMenu("nano-glossary");

            expect(JSON.stringify(viewService.tree)).toBe(before);
            expect(notifications.success).not.toHaveBeenCalled();
            expect(notifications.error).toHaveBeenCalledWith(
                "Remove failed",
                expect.stringContaining("left as it was"),
            );
        }));

        it("does not offer removal for the root or inside a linked subtree", fakeAsync(() => {
            for (const nodeId of ["root", "micro-detection"]) {
                triggerFor(nodeId).click();
                flush();
                fixture.detectChanges();
                const remove = overlayMenuItems().find(
                    (item) => item.getAttribute("data-action-id") === "remove",
                )!;
                expect(remove.disabled).toBe(true);
                triggerFor(nodeId).click();
                flush();
                fixture.detectChanges();
            }
            expect(setChildren).not.toHaveBeenCalled();
        }));
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

/** Small local tree used to drive the move flows: nested moves, alternate parents, and a linked root. */
function buildSpecTree(): HierarchyNode[] {
    const { COURSE, UNIT, MODULE, MICROMODULE, NANOMODULE } =
        LearningObject.Length;
    return [
        {
            id: "root",
            name: "Intro to Cybersecurity",
            length: COURSE,
            editable: true,
            expanded: true,
            children: [
                {
                    id: "unit-foundations",
                    name: "Foundations Unit",
                    length: UNIT,
                    editable: true,
                    expanded: true,
                    children: [
                        {
                            id: "mod-core-concepts",
                            name: "Core Concepts",
                            length: MODULE,
                            editable: true,
                            expanded: true,
                            children: [
                                {
                                    id: "micro-cia-triad",
                                    name: "CIA Triad",
                                    length: MICROMODULE,
                                    editable: true,
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "network-security",
                    name: "Network Security",
                    length: MICROMODULE,
                    editable: true,
                    children: [],
                },
                {
                    id: "incident-response",
                    name: "Incident Response (Linked)",
                    length: MODULE,
                    editable: false,
                    linkedRoot: true,
                    expanded: true,
                    children: [
                        {
                            id: "micro-detection",
                            name: "Detection & Triage",
                            length: MICROMODULE,
                            editable: false,
                            children: [],
                        },
                    ],
                },
                {
                    id: "nano-glossary",
                    name: "Security Glossary",
                    length: NANOMODULE,
                    editable: true,
                    children: [],
                },
            ],
        },
    ];
}
