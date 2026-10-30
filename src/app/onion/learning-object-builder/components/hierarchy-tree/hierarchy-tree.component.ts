import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewContainerRef,
} from "@angular/core";
import {
    CdkDrag,
    CdkDragDrop,
    CdkDragMove,
    CdkDropList,
} from "@angular/cdk/drag-drop";
import {
    FocusMonitor,
    InputModalityDetector,
    LiveAnnouncer,
} from "@angular/cdk/a11y";
import { ToastrOvenService } from "../../../../shared/modules/toaster/notification.service";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { ESCAPE } from "@angular/cdk/keycodes";
import { Observable, Subscription } from "rxjs";
import { LearningObject } from "@entity";
import { HierarchyNodeComponent } from "./hierarchy-node/hierarchy-node.component";
import { HierarchyMovePickerComponent } from "./hierarchy-move-picker/hierarchy-move-picker.component";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyNode, NodeActionId } from "./hierarchy-tree.types";

/**
 * Container for the Builder Hierarchy tree (sc-40233).
 *
 * Renders the effective hierarchy as a folder/tree with expand/collapse,
 * linked/read-only treatment, and drag-and-drop with invalid-drop gating.
 * For this story the data is mock/local, produced by {@link HierarchyViewService};
 * the `+` menu actions are surfaced but inert (wired in sc-40236 / sc-40237).
 *
 * Drag-and-drop model (rebuilt in sc-40233): the WHOLE tree is a single
 * `cdkDropList` (`cdkDropListSortingDisabled`) rather than a group of per-node
 * drop lists. Each node card is a `cdkDrag` living anywhere inside that one
 * list. On drop, the target node is resolved by HIT-TESTING the drop pointer
 * (`event.dropPoint`) against the rendered `.node-row[data-node-id]` elements;
 * dropping a node ONTO another node makes it a CHILD (appended) of that node.
 * The single source of truth for drop validity and the move itself lives in
 * {@link HierarchyViewService}.
 */
@Component({
    selector: "clark-hierarchy-tree",
    templateUrl: "./hierarchy-tree.component.html",
    styleUrls: ["./hierarchy-tree.component.scss"],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        AsyncPipe,
        CdkDropList,
        CdkDrag,
        HierarchyNodeComponent,
    ],
})
export class HierarchyTreeComponent implements OnInit, OnChanges, OnDestroy {
    /**
     * The current (root) learning object. In sc-40233 it is used only to label
     * the root; the tree body is mock data. Later stories derive the real tree
     * from this object's composed children.
     */
    @Input() learningObject?: LearningObject;

    tree$: Observable<HierarchyNode[]>;

    constructor(
        private viewService: HierarchyViewService,
        private host: ElementRef<HTMLElement>,
        private overlay: Overlay,
        private vcr: ViewContainerRef,
        private zone: NgZone,
        private changeDetector: ChangeDetectorRef,
        private notifications: ToastrOvenService,
        private liveAnnouncer: LiveAnnouncer,
        private focusMonitor: FocusMonitor,
        private inputModality: InputModalityDetector,
    ) {}

    ngOnInit(): void {
        this.tree$ = this.viewService.tree$;
        this.viewService.seedMockData();
        // Apply any learning object name that arrived before the tree was seeded.
        if (this.learningObject?.name) {
            this.applyRootName(this.learningObject.name);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        // When a real learning object arrives, reflect its name on the mock root
        // so the tab reads coherently. Full real-data wiring is a later story.
        // Skipped before ngOnInit has seeded the tree (applyRootName no-ops on an
        // empty tree); ngOnInit re-applies the name after seeding.
        if (changes["learningObject"] && this.learningObject?.name) {
            this.applyRootName(this.learningObject.name);
        }
    }

    /** Validity predicate handed to each node; delegates to the view service. */
    readonly canDrop = (
        dragged: HierarchyNode,
        target: HierarchyNode,
    ): boolean => this.viewService.canDrop(dragged, target);

    /** Movability predicate handed to each node; delegates to the view service. */
    readonly canMove = (nodeId: string): boolean =>
        this.viewService.canMove(nodeId);

    onToggleExpanded(id: string): void {
        this.viewService.toggleExpanded(id);
    }

    /** The node currently being dragged anywhere in the tree, or null. */
    draggingNode: HierarchyNode | null = null;

    /**
     * The id of the node the drag pointer is currently hovering over AND which
     * is a valid drop target for the dragged node, or null. Pushed down to each
     * node so it can show the valid-target highlight. Updated live on drag move.
     */
    hoveredTargetId: string | null = null;

    onDragActive(node: HierarchyNode | null): void {
        this.draggingNode = node;
        if (!node) {
            this.hoveredTargetId = null;
        }
    }

    /**
     * Live during a drag: hit-test the pointer against the rendered node rows
     * and record which valid target (if any) it is over, so that node can
     * highlight. Uses the pointer position from the CDK move event.
     */
    onDragMoved(event: CdkDragMove<HierarchyNode>): void {
        const dragged = event.source.data ?? this.draggingNode;
        if (!dragged) {
            return;
        }
        const targetId = this.resolveTargetIdAt(
            event.pointerPosition.x,
            event.pointerPosition.y,
        );
        if (!targetId) {
            this.hoveredTargetId = null;

            return;
        }
        const target = this.viewService.tree.length
            ? findInTree(this.viewService.tree, targetId)
            : undefined;
        this.hoveredTargetId =
            target &&
            this.viewService.canMove(dragged.id) &&
            this.viewService.canDrop(dragged, target)
                ? targetId
                : null;
    }

    /**
     * Drop handler for the single tree drop list. The dragged node's data comes
     * from `cdkDragData`; the TARGET is resolved by hit-testing the drop pointer
     * against the rendered `.node-row` elements. A valid drop (passes `canMove`
     * + `canDrop`) appends the dragged node as a child of the target; anything
     * else is a no-op (CDK reverts the card to its origin).
     */
    onTreeDrop(event: CdkDragDrop<HierarchyNode>): void {
        this.draggingNode = null;
        this.hoveredTargetId = null;

        const dragged = event.item.data as HierarchyNode | undefined;
        if (!dragged) {
            return;
        }

        const targetId = this.resolveTargetIdAt(
            event.dropPoint.x,
            event.dropPoint.y,
        );
        if (!targetId || targetId === dragged.id) {
            return;
        }

        const target = findInTree(this.viewService.tree, targetId);
        if (!target) {
            return;
        }
        if (!this.viewService.canMove(dragged.id)) {
            return;
        }
        if (!this.viewService.canDrop(dragged, target)) {
            return;
        }

        // Dropping ONTO a node appends the dragged node to that node's children,
        // nesting it UNDER the target (not inserted beside it). Omit the index
        // so the view service appends.
        if (this.viewService.moveNode(dragged.id, targetId)) {
            this.notifyMove(dragged.id, targetId);
        }
    }

    /**
     * Find the id of the node whose rendered row contains the given viewport
     * point. Walks the `.node-row[data-node-id]` elements inside this tree and
     * returns the first whose bounding rect contains the point. Returns null if
     * the point is not over any node row.
     */
    private resolveTargetIdAt(x: number, y: number): string | null {
        const rows = this.host.nativeElement.querySelectorAll<HTMLElement>(
            ".node-row[data-node-id]",
        );
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rect = row.getBoundingClientRect();
            if (
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom
            ) {
                return row.getAttribute("data-node-id");
            }
        }

        return null;
    }

    // --- Action Menu / Move Picker ---

    /** The live Move Picker overlay, or null when the picker is closed. */
    private moveOverlayRef: OverlayRef | null = null;

    /**
     * The attached Move Picker component instance (and its change detector),
     * kept so {@link applyMove} can surface an inline error in the open picker
     * on a failed move. Null while the picker is closed.
     */
    private movePickerRef: ComponentRef<HierarchyMovePickerComponent> | null =
        null;

    /** Subscriptions tied to the open picker overlay; torn down on close. */
    private moveSubscriptions: Subscription[] = [];

    /** Stable identity survives destruction of a row when it is reparented. */
    private moveOriginNodeId: string | null = null;
    private pendingMoveTimer: ReturnType<typeof setTimeout> | null = null;
    private destroyed = false;

    ngOnDestroy(): void {
        this.destroyed = true;
        if (this.pendingMoveTimer !== null) {
            clearTimeout(this.pendingMoveTimer);
            this.pendingMoveTimer = null;
        }
        this.closeMovePicker(false);
    }

    /** Let MatMenu finish its click handling before attaching the picker. */
    onMenuAction(payload: { actionId: NodeActionId; nodeId: string }): void {
        if (payload.actionId !== "move" || this.destroyed) {
            return;
        }
        if (this.pendingMoveTimer !== null) {
            clearTimeout(this.pendingMoveTimer);
        }
        this.pendingMoveTimer = this.zone.run(() =>
            setTimeout(() => {
                this.pendingMoveTimer = null;
                if (!this.destroyed) {
                    this.openMovePicker(payload.nodeId);
                }
            }, 0),
        );
    }

    /**
     * The Action Menu kebab button for a given node row, used to restore focus
     * after the picker closes. Returns null if the row is not in the DOM.
     */
    private triggerButtonFor(nodeId: string): HTMLElement | null {
        const parentId = this.viewService.parentIdOf(nodeId);
        const rows = this.host.nativeElement.querySelectorAll<HTMLElement>(
            ".node-row[data-node-id]",
        );
        // Leave animations can temporarily keep the old row in the DOM. Match
        // the current parent as well as the ID to focus only the live location.
        const row = Array.from(rows).find((candidate) => {
            if (candidate.getAttribute("data-node-id") !== nodeId) {
                return false;
            }
            const parentComponent = candidate
                .closest("clark-hierarchy-node")
                ?.parentElement?.closest("clark-hierarchy-node");
            const renderedParentId = parentComponent
                ?.querySelector(".node-row")
                ?.getAttribute("data-node-id");
            return renderedParentId === parentId;
        });
        return row?.querySelector<HTMLElement>(".action-menu-button") ?? null;
    }

    /** Preserve keyboard focus without leaving Material's programmatic focus layer behind. */
    private restoreNodeFocus(nodeId: string): void {
        const button = this.triggerButtonFor(nodeId);
        if (button) {
            this.focusMonitor.focusVia(
                button,
                this.inputModality.mostRecentModality ?? "keyboard",
            );
        }
    }

    /**
     * Open the Move Destination Picker for `nodeId` in a CDK Overlay.
     *
     * Re-checks `canMove` through the service as defense in depth (the menu
     * item is already disabled for non-movable nodes) and no-ops when
     * the node cannot move. Computes valid destinations through the service,
     * records the originating trigger for focus restoration, and
     * attaches a focus-trapped, backdropped overlay wired so backdrop click and
     * Escape both cancel.
     */
    private openMovePicker(nodeId: string): void {
        if (!this.viewService.canMove(nodeId)) {
            return;
        }

        const node = findInTree(this.viewService.tree, nodeId);
        const destinations = this.viewService.validDestinations(nodeId);

        // Tear down any previously open picker before opening a new one.
        this.closeMovePicker(false);
        this.moveOriginNodeId = nodeId;

        const overlayRef = this.overlay.create({
            hasBackdrop: true,
            disposeOnNavigation: true,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy: this.overlay
                .position()
                .global()
                .centerHorizontally()
                .centerVertically(),
        });
        this.moveOverlayRef = overlayRef;

        const portal = new ComponentPortal(
            HierarchyMovePickerComponent,
            this.vcr,
        );
        const pickerRef = overlayRef.attach(portal);
        this.movePickerRef = pickerRef;
        pickerRef.setInput("movingNodeName", node?.name ?? "");
        pickerRef.setInput("movingNodeId", nodeId);
        pickerRef.setInput("hierarchy", this.viewService.tree);
        pickerRef.setInput("destinations", destinations);
        pickerRef.changeDetectorRef.detectChanges();

        this.moveSubscriptions.push(
            pickerRef.instance.confirm.subscribe((event) =>
                this.applyMove(nodeId, event.targetId),
            ),
            pickerRef.instance.cancel.subscribe(() => this.closeMovePicker()),
            overlayRef.backdropClick().subscribe(() => this.closeMovePicker()),
            overlayRef.detachments().subscribe(() => this.closeMovePicker()),
            overlayRef.keydownEvents().subscribe((keyEvent) => {
                if (keyEvent.keyCode === ESCAPE) {
                    keyEvent.preventDefault();
                    this.closeMovePicker();
                }
            }),
        );
    }

    /** Inline error surfaced in the open picker when a move cannot be applied. */
    private static readonly MOVE_FAILED_MESSAGE =
        "That move could not be completed.";

    /**
     * Apply the author's confirmed move through the single source of truth.
     *
     * On success (`moveNode` returns true) the updated `tree$` already reflects
     * the new parent/position; we close the picker, which restores focus to the
     * originating Action Menu button.
     *
     * On failure (`moveNode` returns false) the hierarchy is left unchanged; we
     * keep the picker OPEN and surface an inline error on the attached picker so
     * the author can retry or cancel. Confirmed moves append as the last child.
     */
    private applyMove(nodeId: string, targetId: string): void {
        const applied = this.viewService.moveNode(nodeId, targetId);
        if (applied) {
            this.closeMovePicker(false);
            // A different parent creates a new row instance. Render first so
            // focus is restored to its live trigger, not the removed button.
            // A destination can live under a collapsed ancestor. Reveal the
            // moved row so keyboard users can continue from its new location.
            let parentId = this.viewService.parentIdOf(nodeId);
            while (parentId) {
                const parent = findInTree(this.viewService.tree, parentId);
                if (parent && !parent.expanded) {
                    this.viewService.toggleExpanded(parentId);
                }
                parentId = this.viewService.parentIdOf(parentId);
            }
            this.changeDetector.detectChanges();
            this.restoreNodeFocus(nodeId);
            this.notifyMove(nodeId, targetId);

            return;
        }

        // Rejected move: hierarchy untouched, picker stays open with an error.
        if (this.movePickerRef) {
            this.movePickerRef.instance.errorMessage =
                HierarchyTreeComponent.MOVE_FAILED_MESSAGE;
            this.movePickerRef.changeDetectorRef.detectChanges();
        }
    }

    /** Both interaction paths report success only after the move engine accepts it. */
    private notifyMove(nodeId: string, targetId: string): void {
        const name =
            findInTree(this.viewService.tree, nodeId)?.name?.trim() ||
            "Unnamed object";
        const parentName =
            findInTree(this.viewService.tree, targetId)?.name?.trim() ||
            "Unnamed object";
        const message = `“${name}” moved into “${parentName}”.`;
        this.notifications.success("Object moved", message);
        void this.liveAnnouncer.announce(message, "polite");
    }

    /**
     * Single close path for the picker: dispose the overlay, tear down its
     * subscriptions, clear transient state, and restore focus to the Action
     * Menu button that opened it.
     */
    private closeMovePicker(restoreFocus = true): void {
        const originNodeId = this.moveOriginNodeId;
        this.moveOriginNodeId = null;
        this.moveSubscriptions.forEach((sub) => sub.unsubscribe());
        this.moveSubscriptions = [];
        if (this.moveOverlayRef) {
            this.moveOverlayRef.dispose();
            this.moveOverlayRef = null;
        }
        this.movePickerRef = null;
        if (restoreFocus && !this.destroyed && originNodeId) {
            this.restoreNodeFocus(originNodeId);
        }
    }

    trackById(_index: number, node: HierarchyNode): string {
        return node.id;
    }

    private applyRootName(name: string): void {
        const current = this.viewService.tree;
        if (!current.length) {
            return;
        }
        const [root, ...rest] = current;
        this.viewService.setTree([{ ...root, name }, ...rest]);
    }
}

/** Find a node by id anywhere in a forest (view-only lookup for hit-testing). */
function findInTree(
    nodes: HierarchyNode[],
    id: string,
): HierarchyNode | undefined {
    for (const node of nodes) {
        if (node.id === id) {
            return node;
        }
        const found = findInTree(node.children, id);
        if (found) {
            return found;
        }
    }

    return undefined;
}
