import { Component } from "@angular/core";
import {
    ComponentFixture,
    fakeAsync,
    flush,
    TestBed,
    waitForAsync,
} from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { LearningObject } from "@entity";

import { HierarchyNodeComponent } from "./hierarchy-node.component";
import { HierarchyNode, NodeActionId } from "../hierarchy-tree.types";

/**
 * Component tests for `HierarchyNodeComponent`
 *
 * The node row renders a single kebab-style Action Menu trigger on EVERY row
 * (replacing the legacy `+` affordance) and a `<mat-menu>` whose items are
 * driven by the `menuActions` getter. These tests exercise that contract via
 * TestBed. The mat-menu renders into a CDK overlay, so after clicking the
 * trigger we query the document overlay container for `mat-menu-item`s. This
 * DOM-driven approach (trigger click + overlay queries) is more reliable under
 * jsdom than harness key simulation, so it is used throughout.
 *
 */
describe("HierarchyNodeComponent", () => {
    /**
     * Host wrapper so we can bind inputs declaratively and capture the
     * `menuAction` output exactly as the tree container would.
     */
    @Component({
        standalone: true,
        imports: [HierarchyNodeComponent],
        template: `
            <clark-hierarchy-node
                [node]="node"
                [isRoot]="isRoot"
                [canMovePredicate]="canMovePredicate"
                (menuAction)="onMenuAction($event)"></clark-hierarchy-node>
        `,
    })
    class HostComponent {
        node: HierarchyNode = makeNode();
        isRoot = false;
        canMovePredicate: (nodeId: string) => boolean = () => true;
        emitted: Array<{ actionId: NodeActionId; nodeId: string }> = [];

        onMenuAction(payload: {
            actionId: NodeActionId;
            nodeId: string;
        }): void {
            this.emitted.push(payload);
        }
    }

    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let originalGetComputedStyle: typeof window.getComputedStyle;

    // The repo's global jest mock replaces `getComputedStyle` with a plain
    // object that has no `getPropertyValue`, which MatMenu.setElevation calls
    // when the menu opens. Patch it locally (and restore after) so opening the
    // menu doesn't throw, instead of relying on Angular swallowing the error.
    beforeAll(() => {
        originalGetComputedStyle = window.getComputedStyle;
        Object.defineProperty(window, "getComputedStyle", {
            configurable: true,
            value: () => ({
                display: "none",
                appearance: ["-webkit-appearance"],
                getPropertyValue: () => "",
            }),
        });
    });

    afterAll(() => {
        Object.defineProperty(window, "getComputedStyle", {
            configurable: true,
            value: originalGetComputedStyle,
        });
    });

    /** Minimal, valid HierarchyNode fixture; override fields per-test. */
    function makeNode(overrides: Partial<HierarchyNode> = {}): HierarchyNode {
        return {
            id: "micro-cia-triad",
            name: "CIA Triad",
            length: LearningObject.Length.MICROMODULE,
            editable: true,
            children: [],
            ...overrides,
        };
    }

    /** All mat-menu-item buttons currently rendered in the overlay. */
    function overlayMenuItems(): HTMLButtonElement[] {
        return Array.from(
            document.querySelectorAll<HTMLButtonElement>(
                ".cdk-overlay-container button[mat-menu-item]",
            ),
        );
    }

    /** The single Action Menu trigger on the rendered row. */
    function triggerButton(): HTMLButtonElement {
        return fixture.debugElement.query(By.css(".action-menu-button"))
            .nativeElement as HTMLButtonElement;
    }

    /** Open the menu and settle animations/overlay. */
    function openMenu(): void {
        triggerButton().click();
        fixture.detectChanges();
    }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HostComponent, NoopAnimationsModule],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
    });

    afterEach(() => {
        // mat-menu leaves its overlay attached between tests; clear it so the
        // next test's overlay queries don't see stale menu items.
        document
            .querySelectorAll(".cdk-overlay-container")
            .forEach((el) => (el.innerHTML = ""));
    });

    function render(): void {
        fixture.detectChanges();
    }

    describe("single Action Menu, no legacy affordance", () => {
        it("renders exactly one Action Menu button on the row", () => {
            render();

            const buttons = fixture.debugElement.queryAll(
                By.css(".action-menu-button"),
            );
            expect(buttons.length).toBe(1);
        });

        it("renders the Action Menu even on a non-movable root row", () => {
            host.isRoot = true;
            host.canMovePredicate = () => false;
            render();

            const buttons = fixture.debugElement.queryAll(
                By.css(".action-menu-button"),
            );
            expect(buttons.length).toBe(1);
        });

        it("retains no legacy `+` add button", () => {
            render();

            expect(
                fixture.debugElement.query(By.css(".add-button")),
            ).toBeNull();
        });
    });

    describe("trigger accessibility", () => {
        it("exposes an accessible name describing the node", () => {
            render();

            expect(triggerButton().getAttribute("aria-label")).toBe(
                "Actions for CIA Triad",
            );
        });

        it("advertises that it opens a popup", () => {
            render();

            expect(triggerButton().getAttribute("aria-haspopup")).toBeTruthy();
        });

        it("reflects aria-expanded false when closed and true once opened", fakeAsync(() => {
            render();

            const trigger = triggerButton();
            // MatMenuTrigger renders aria-expanded="false" while closed.
            expect(trigger.getAttribute("aria-expanded")).toBe("false");

            // Opening attaches the overlay and MatMenuTrigger flips
            // aria-expanded via the menu's async `opened` event; flush so the
            // attribute reflects the settled open state.
            triggerButton().click();
            flush();
            fixture.detectChanges();

            expect(triggerButton().getAttribute("aria-expanded")).toBe("true");

            // Close the menu and drain the overlay's teardown timers so the
            // fakeAsync zone ends with an empty queue.
            triggerButton().click();
            flush();
            fixture.detectChanges();
        }));
    });

    describe("menuActions composition", () => {
        it("enables Move for a movable node and omits the future Add Child action", () => {
            host.isRoot = false;
            host.canMovePredicate = () => true;
            render();
            openMenu();

            const items = overlayMenuItems();
            expect(items.length).toBe(1);

            const move = items[0];
            expect(move.getAttribute("data-action-id")).toBe("move");
            expect(move.textContent).toContain("Move Object");
            expect(move.disabled).toBe(false);
            expect(move.getAttribute("aria-disabled")).not.toBe("true");

            expect(
                document.querySelector('[data-action-id="add-child"]'),
            ).toBeNull();
        });

        it("renders Move present-but-disabled when the predicate says not movable", () => {
            host.isRoot = false;
            host.canMovePredicate = () => false;
            render();
            openMenu();

            const items = overlayMenuItems();
            expect(items.length).toBe(1);

            const move = items[0];
            expect(move.getAttribute("data-action-id")).toBe("move");
            expect(move.disabled).toBe(true);
        });

        it("renders Move present-but-disabled for the root even when the predicate allows it", () => {
            host.isRoot = true;
            host.canMovePredicate = () => true;
            render();
            openMenu();

            const items = overlayMenuItems();
            expect(items.length).toBe(1);
            expect(items[0].getAttribute("data-action-id")).toBe("move");
            expect(items[0].disabled).toBe(true);
        });
    });

    describe("selecting Move emits the intent", () => {
        it("keeps the Move item attached between pointer down and click", () => {
            render();
            openMenu();

            const move = overlayMenuItems()[0];
            move.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
            fixture.detectChanges();

            // A browser only delivers the click to this item if Angular has
            // kept the original button attached throughout the gesture.
            expect(overlayMenuItems()[0]).toBe(move);
            expect(move.isConnected).toBe(true);
            move.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
            move.click();
            fixture.detectChanges();

            expect(host.emitted).toEqual([
                { actionId: "move", nodeId: host.node.id },
            ]);
        });

        it("emits menuAction { actionId: 'move', nodeId } when Move is selected", () => {
            host.node = makeNode({
                id: "unit-foundations",
                name: "Foundations",
            });
            host.canMovePredicate = () => true;
            render();
            openMenu();

            const move = overlayMenuItems()[0];
            expect(move.disabled).toBe(false);

            move.click();
            fixture.detectChanges();

            expect(host.emitted).toEqual([
                { actionId: "move", nodeId: "unit-foundations" },
            ]);
        });

        it("does not emit when the disabled Move item is clicked", () => {
            host.canMovePredicate = () => false;
            render();
            openMenu();

            const move = overlayMenuItems()[0];
            expect(move.disabled).toBe(true);
            move.click();
            fixture.detectChanges();

            expect(host.emitted).toEqual([]);
        });
    });
});
