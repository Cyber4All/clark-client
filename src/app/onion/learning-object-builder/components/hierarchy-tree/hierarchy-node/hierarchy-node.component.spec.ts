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
                [canAddChildPredicate]="canAddChildPredicate"
                (menuAction)="onMenuAction($event)"></clark-hierarchy-node>
        `,
    })
    class HostComponent {
        node: HierarchyNode = makeNode();
        isRoot = false;
        canMovePredicate: (nodeId: string) => boolean = () => true;
        canAddChildPredicate: (nodeId: string) => boolean = () => true;
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

    /** The open menu item with the given action id. */
    function menuItem(actionId: string): HTMLButtonElement {
        return overlayMenuItems().find(
            (item) => item.getAttribute("data-action-id") === actionId,
        )!;
    }
    /** Action ids of the open menu items, in order. */
    function actionIds(): Array<string | null> {
        return overlayMenuItems().map((item) =>
            item.getAttribute("data-action-id"),
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
        it("lists Add Child, Edit in Builder, Move, and Remove in that order", () => {
            host.isRoot = false;
            host.node = makeNode({ cuid: "c-1", version: 0 });
            render();
            openMenu();
            expect(actionIds()).toEqual([
                "add-child",
                "edit-in-builder",
                "move",
                "remove",
            ]);
            expect(menuItem("add-child").textContent).toContain(
                "Add Child Object",
            );
            expect(menuItem("edit-in-builder").textContent).toContain(
                "Edit in Builder",
            );
            expect(menuItem("move").textContent).toContain("Move Object");
            expect(menuItem("remove").textContent).toContain(
                "Remove from Hierarchy",
            );
        });
        it("enables every item for an editable, movable node that can hold children and has a Builder address", () => {
            host.isRoot = false;
            host.node = makeNode({ cuid: "c-1", version: 0 });
            host.canMovePredicate = () => true;
            host.canAddChildPredicate = () => true;
            render();
            openMenu();
            for (const item of overlayMenuItems()) {
                expect(item.disabled).toBe(false);
                expect(item.getAttribute("aria-disabled")).not.toBe("true");
            }
        });
        it("renders Move and Remove present-but-disabled when the predicate says not movable", () => {
            host.isRoot = false;
            host.canMovePredicate = () => false;
            render();
            openMenu();
            expect(menuItem("move").disabled).toBe(true);
            expect(menuItem("remove").disabled).toBe(true);
        });
        it("renders Move and Remove present-but-disabled for the root even when the predicate allows it", () => {
            host.isRoot = true;
            host.canMovePredicate = () => true;
            render();
            openMenu();
            expect(menuItem("move").disabled).toBe(true);
            expect(menuItem("remove").disabled).toBe(true);
        });
    });
    describe("Add Child Object", () => {
        it("is disabled when the predicate refuses (read-only, Nanomodule, or saving)", () => {
            host.canAddChildPredicate = () => false;
            render();
            openMenu();
            expect(menuItem("add-child").disabled).toBe(true);
        });
        it("is still available on the root", () => {
            host.isRoot = true;
            host.canAddChildPredicate = () => true;
            render();
            openMenu();
            expect(menuItem("add-child").disabled).toBe(false);
        });
        it("asks the predicate about this node's id", () => {
            const predicate = jest.fn().mockReturnValue(true);
            host.node = makeNode({ id: "unit-foundations" });
            host.canAddChildPredicate = predicate;
            render();
            openMenu();
            expect(predicate).toHaveBeenCalledWith("unit-foundations");
        });
        it("emits the add-child intent with this node's id", () => {
            host.node = makeNode({ id: "unit-foundations" });
            render();
            openMenu();
            menuItem("add-child").click();
            fixture.detectChanges();
            expect(host.emitted).toEqual([
                { actionId: "add-child", nodeId: "unit-foundations" },
            ]);
        });
        it("does not emit when disabled", () => {
            host.canAddChildPredicate = () => false;
            render();
            openMenu();
            menuItem("add-child").click();
            fixture.detectChanges();
            expect(host.emitted).toEqual([]);
        });
    });
    describe("Edit in Builder", () => {
        it("is enabled for an editable non-root node with a cuid and version", () => {
            host.node = makeNode({ cuid: "c-1", version: 0 });
            render();
            openMenu();
            expect(menuItem("edit-in-builder").disabled).toBe(false);
        });
        it("is disabled without a version", () => {
            host.node = makeNode({ cuid: "c-1" });
            render();
            openMenu();
            expect(menuItem("edit-in-builder").disabled).toBe(true);
        });
        it("is disabled without a cuid", () => {
            host.node = makeNode({ version: 2 });
            render();
            openMenu();
            expect(menuItem("edit-in-builder").disabled).toBe(true);
        });
        it("is disabled for a read-only node", () => {
            host.node = makeNode({
                cuid: "c-1",
                version: 0,
                editable: false,
                linkedRoot: true,
            });
            render();
            openMenu();
            expect(menuItem("edit-in-builder").disabled).toBe(true);
        });
        it("is disabled for the root, which is already open in this tab", () => {
            host.isRoot = true;
            host.node = makeNode({ cuid: "c-1", version: 0 });
            render();
            openMenu();
            expect(menuItem("edit-in-builder").disabled).toBe(true);
        });
        it("emits the edit-in-builder intent with this node's id", () => {
            host.node = makeNode({ id: "u1", cuid: "c-1", version: 0 });
            render();
            openMenu();
            menuItem("edit-in-builder").click();
            fixture.detectChanges();
            expect(host.emitted).toEqual([
                { actionId: "edit-in-builder", nodeId: "u1" },
            ]);
        });
    });
    describe("selecting Remove emits the intent", () => {
        it("emits the remove action with this node's id", () => {
            host.isRoot = false;
            host.canMovePredicate = () => true;
            render();
            openMenu();

            const remove = overlayMenuItems().find(
                (item) => item.getAttribute("data-action-id") === "remove",
            )!;
            remove.click();
            fixture.detectChanges();

            expect(host.emitted).toEqual([
                { actionId: "remove", nodeId: host.node.id },
            ]);
        });
    });

    describe("selecting Move emits the intent", () => {
        it("keeps the Move item attached between pointer down and click", () => {
            render();
            openMenu();

            const move = menuItem("move");
            move.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
            fixture.detectChanges();

            // A browser only delivers the click to this item if Angular has
            // kept the original button attached throughout the gesture.
            expect(menuItem("move")).toBe(move);
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

            const move = menuItem("move");
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

            const move = menuItem("move");
            expect(move.disabled).toBe(true);
            move.click();
            fixture.detectChanges();

            expect(host.emitted).toEqual([]);
        });
    });

    describe("read-only labels", () => {
        /** Text of each rendered read-only label, in document order. */
        function labels(): string[] {
            return fixture.debugElement
                .queryAll(By.css(".linked-label"))
                .map((el) => (el.nativeElement as HTMLElement).textContent!);
        }

        it("renders no read-only label on an editable node", () => {
            render();
            expect(labels()).toEqual([]);
        });

        it("labels the linked root Linked and its descendants Inherited", () => {
            host.node = makeNode({
                id: "incident-response",
                name: "Incident Response",
                editable: false,
                linkedRoot: true,
                expanded: true,
                children: [
                    makeNode({
                        id: "micro-detection",
                        name: "Detection",
                        editable: false,
                    }),
                ],
            });
            render();

            const [root, child] = labels();
            expect(root).toContain("Linked · Read only");
            expect(root).not.toContain("Inherited");
            expect(root).toContain(
                "This object is linked and belongs to another author. Linked objects cannot be edited.",
            );
            expect(child).toContain("Inherited · Read only");
            expect(child).toContain(
                "This object is inherited and belongs to another author. Inherited objects cannot be edited.",
            );
        });

        it("keeps a standalone read-only node labeled Linked", () => {
            host.node = makeNode({ editable: false });
            render();
            expect(labels()[0]).toContain("Linked · Read only");
            expect(labels()[0]).not.toContain("Inherited");
        });

        it("keeps the linked root unmuted and inherited children muted while preserving permissions", () => {
            host.node = makeNode({
                id: "linked-parent",
                editable: false,
                linkedRoot: true,
                expanded: true,
                children: [
                    makeNode({ id: "inherited-child", editable: false }),
                ],
            });
            host.canMovePredicate = (id) => id === "linked-parent";
            render();

            const rows = fixture.debugElement.queryAll(
                By.css(".hierarchy-node--linked"),
            );
            expect(rows.length).toBe(2);
            rows.forEach((row) => {
                const card = row.query(By.css(".node-content"));
                expect(
                    card.query(By.css(".linked-label .fa-lock")),
                ).toBeTruthy();
                expect(
                    card.query(By.css(".linked-label")).nativeElement
                        .textContent,
                ).toContain("Read only");
                expect(card.nativeElement.textContent).toContain(
                    "cannot be edited.",
                );
            });
            const nodes = fixture.debugElement.queryAll(
                By.directive(HierarchyNodeComponent),
            );
            const rootRow = nodes[0].query(By.css(".hierarchy-node"));
            const childRow = nodes[1].query(By.css(".hierarchy-node"));
            expect(rootRow.nativeElement.classList).not.toContain(
                "hierarchy-node--muted",
            );
            expect(childRow.nativeElement.classList).toContain(
                "hierarchy-node--muted",
            );
            expect(nodes[0].componentInstance.isExpanded).toBe(true);
            expect(nodes[0].componentInstance.canMove).toBe(true);
            expect(nodes[1].componentInstance.canMove).toBe(false);
            expect(nodes[1].query(By.css(".drag-handle"))).toBeNull();
            openMenu();
            expect(menuItem("move").disabled).toBe(false);

            const toggle = nodes[0].query(By.css(".toggle"));
            const toggled = jest.spyOn(
                nodes[0].componentInstance.toggleExpanded,
                "emit",
            );
            toggle.nativeElement.click();
            expect(toggled).toHaveBeenCalledWith("linked-parent");
        });

        it("makes the label focusable so keyboard users can reach the tooltip", () => {
            host.node = makeNode({ editable: false });
            render();
            const label = fixture.debugElement.query(By.css(".linked-label"))
                .nativeElement as HTMLElement;
            expect(label.getAttribute("tabindex")).toBe("0");
        });
    });
});
