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
import { Observable, Subject, Subscription } from "rxjs";
import { take, takeUntil } from "rxjs/operators";
import { LearningObject } from "@entity";
import { HierarchyNodeComponent } from "./hierarchy-node/hierarchy-node.component";
import { HierarchyMovePickerComponent } from "./hierarchy-move-picker/hierarchy-move-picker.component";
import { HierarchyRemoveConfirmComponent } from "./hierarchy-remove-confirm/hierarchy-remove-confirm.component";
import { HierarchyViewService } from "./hierarchy-view.service";
import { HierarchyLoaderService } from "./hierarchy-loader.service";
import {
    HierarchyEditError,
    HierarchyEditOutcome,
    HierarchyEditService,
} from "./hierarchy-edit.service";
import {
    HierarchyLoadStatus,
    HierarchyNode,
    NodeActionId,
} from "./hierarchy-tree.types";

/**
 * Container for the Builder Hierarchy tree (sc-40233).
 *
 * Renders the effective hierarchy as a folder/tree with expand/collapse,
 * linked/read-only treatment, and drag-and-drop with invalid-drop gating.
 * The hierarchy is loaded from the API by {@link HierarchyLoaderService}
 * (sc-40640) and held by {@link HierarchyViewService}; this component renders
 * the loading, error, empty and ready states. Moving and removing children is
 * saved immediately through {@link HierarchyEditService} (sc-40642): the tree
 * updates first, and on a failed save it is restored and an error is shown.
 * Creating and linking children are wired in sc-40236 / sc-40237.
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
    /** The current (root) learning object whose hierarchy is loaded. */
    @Input() learningObject?: LearningObject;

    tree$: Observable<HierarchyNode[]>;
    status$: Observable<HierarchyLoadStatus>;
    saving$: Observable<boolean>;

    /** Ends in-flight edit subscriptions when the tree is destroyed. */
    private readonly destroy$ = new Subject<void>();

    constructor(
        private viewService: HierarchyViewService,
        private loader: HierarchyLoaderService,
        private editService: HierarchyEditService,
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
        this.status$ = this.loader.status$;
        this.saving$ = this.editService.saving$;
        this.loadHierarchy();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Before ngOnInit the first load is started there; afterwards a new
        // learning object (different id) reloads the hierarchy.
        const change = changes["learningObject"];
        if (
            change &&
            !change.firstChange &&
            change.currentValue?.id !== change.previousValue?.id
        ) {
            this.loadHierarchy();
        }
    }

    /** Retry after a failed load. */
    onRetry(): void {
        this.loader.retry();
    }

    private loadHierarchy(): void {
        if (this.learningObject?.id) {
            this.loader.load(this.learningObject);
        }
    }

    /** Validity predicate handed to each node; delegates to the view service. */
    readonly canDrop = (
        dragged: HierarchyNode,
        target: HierarchyNode,
    ): boolean => this.viewService.canDrop(dragged, target);

    /**
     * Movability predicate handed to each node; delegates to the view service.
     * Nothing can be picked up, moved, or removed while a change is saving, so
     * a failed save can be rolled back to a tree nothing else touched.
     */
    readonly canMove = (nodeId: string): boolean =>
        !this.editService.saving && this.viewService.canMove(nodeId);

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
        // nesting it UNDER the target (not inserted beside it). The edit service
        // applies the move, saves it, and restores the tree if the save fails.
        // An invalid or busy drop is a silent no-op (CDK reverts the card).
        this.persist(this.editService.move(dragged.id, targetId), {
            onSuccess: (outcome) => this.announceMoved(outcome),
            onFailure: (error) => this.toastFailure(error, "move"),
        });
    }

    /**
     * Run one edit and route its result. A reload is requested when the edit
     * was only half applied on the server, or when the edited parent appears
     * more than once in the tree (the server changed every occurrence).
     */
    private persist(
        edit$: Observable<HierarchyEditOutcome>,
        handlers: {
            onSuccess: (outcome: HierarchyEditOutcome) => void;
            onFailure: (error: HierarchyEditError) => void;
        },
    ): void {
        edit$.pipe(take(1), takeUntil(this.destroy$)).subscribe({
            next: (outcome) => {
                handlers.onSuccess(outcome);
                if (outcome.reloadRecommended) {
                    this.loader.retry();
                }
            },
            error: (error: unknown) => {
                const failure =
                    error instanceof HierarchyEditError
                        ? error
                        : new HierarchyEditError("failed", false, error);
                if (failure.reloadRequired) {
                    this.loader.retry();
                }
                handlers.onFailure(failure);
            },
        });
    }

    /** Toast for a save that failed; refused (invalid or busy) edits stay silent. */
    private toastFailure(
        error: HierarchyEditError,
        action: "move" | "remove",
    ): void {
        if (error.reason !== "failed") {
            return;
        }
        const message =
            action === "move"
                ? "The object could not be moved, so your hierarchy was left as it was."
                : "The object could not be removed, so your hierarchy was left as it was.";
        this.notifications.error(
            action === "move" ? "Move failed" : "Remove failed",
            error.reloadRequired
                ? `${message} The hierarchy was reloaded to show what is saved.`
                : message,
        );
        void this.liveAnnouncer.announce(message, "assertive");
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
        this.destroy$.next();
        this.destroy$.complete();
        if (this.pendingMoveTimer !== null) {
            clearTimeout(this.pendingMoveTimer);
            this.pendingMoveTimer = null;
        }
        this.closeMovePicker(false);
        this.closeRemoveConfirm(false);
    }

    /**
     * Let MatMenu finish its click handling before acting. Opening the picker
     * or removing the row (which destroys the menu's own trigger) both wait one
     * tick.
     */
    onMenuAction(payload: { actionId: NodeActionId; nodeId: string }): void {
        if (
            (payload.actionId !== "move" && payload.actionId !== "remove") ||
            this.destroyed
        ) {
            return;
        }
        if (this.pendingMoveTimer !== null) {
            clearTimeout(this.pendingMoveTimer);
        }
        this.pendingMoveTimer = this.zone.run(() =>
            setTimeout(() => {
                this.pendingMoveTimer = null;
                if (this.destroyed) {
                    return;
                }
                if (payload.actionId === "move") {
                    this.openMovePicker(payload.nodeId);
                } else {
                    this.removeChild(payload.nodeId);
                }
            }, 0),
        );
    }

    /** The live remove-confirmation overlay, or null when it is closed. */
    private removeOverlayRef: OverlayRef | null = null;

    /** Subscriptions tied to the open confirmation; torn down on close. */
    private removeSubscriptions: Subscription[] = [];

    /** The row whose Remove action opened the confirmation (focus restore). */
    private removeOriginNodeId: string | null = null;

    /**
     * Ask the author to confirm removing `nodeId` from its parent. Nothing is
     * sent until they confirm; Cancel, Escape, and a backdrop click leave the
     * hierarchy untouched and return focus to the row's menu button.
     */
    private removeChild(nodeId: string): void {
        if (!this.canMove(nodeId)) {
            return;
        }
        const node = findInTree(this.viewService.tree, nodeId);
        const parent = this.viewService.getParent(nodeId);
        if (!node || !parent) {
            return;
        }

        // Replace any confirmation that is already open.
        this.closeRemoveConfirm(false);
        this.removeOriginNodeId = nodeId;

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
        this.removeOverlayRef = overlayRef;

        const confirmRef = overlayRef.attach(
            new ComponentPortal(HierarchyRemoveConfirmComponent, this.vcr),
        );
        confirmRef.setInput("nodeName", node.name ?? "");
        confirmRef.setInput("parentName", parent.name ?? "");
        confirmRef.setInput("descendantCount", countDescendants(node));
        confirmRef.changeDetectorRef.detectChanges();

        this.removeSubscriptions.push(
            confirmRef.instance.confirm.subscribe(() => {
                // The removed row (and its button) will be gone, so do not
                // restore focus to it; the success handler focuses the parent.
                this.closeRemoveConfirm(false);
                this.saveRemoval(nodeId);
            }),
            confirmRef.instance.cancel.subscribe(() =>
                this.closeRemoveConfirm(),
            ),
            overlayRef
                .backdropClick()
                .subscribe(() => this.closeRemoveConfirm()),
            overlayRef.detachments().subscribe(() => this.closeRemoveConfirm()),
            overlayRef.keydownEvents().subscribe((keyEvent) => {
                if (keyEvent.keyCode === ESCAPE) {
                    keyEvent.preventDefault();
                    this.closeRemoveConfirm();
                }
            }),
        );
    }

    /** Single close path for the confirmation, mirroring the Move picker. */
    private closeRemoveConfirm(restoreFocus = true): void {
        const originNodeId = this.removeOriginNodeId;
        this.removeOriginNodeId = null;
        this.removeSubscriptions.forEach((sub) => sub.unsubscribe());
        this.removeSubscriptions = [];
        if (this.removeOverlayRef) {
            this.removeOverlayRef.dispose();
            this.removeOverlayRef = null;
        }
        if (restoreFocus && !this.destroyed && originNodeId) {
            this.restoreNodeFocus(originNodeId);
        }
    }

    /**
     * Unlink `nodeId` from its parent and save it. The learning object itself
     * stays in the author's library. Focus moves to the parent's menu button
     * because the removed row (and its button) no longer exists.
     */
    private saveRemoval(nodeId: string): void {
        const parentId = this.viewService.parentIdOf(nodeId);
        this.persist(this.editService.remove(nodeId), {
            onSuccess: (outcome) => {
                this.changeDetector.detectChanges();
                if (parentId) {
                    this.restoreNodeFocus(parentId);
                }
                const message = `“${outcome.name}” was removed from “${outcome.parentName}”. It is still in your library.`;
                this.notifications.success("Object removed", message);
                void this.liveAnnouncer.announce(message, "polite");
            },
            onFailure: (error) => this.toastFailure(error, "remove"),
        });
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
        pickerRef.setInput(
            "unavailableReasons",
            this.viewService.unavailableReasons(nodeId),
        );
        // The API cannot save the order of children yet (sc-40642), so moving a
        // node "within" its current parent is not offered.
        pickerRef.setInput("allowCurrentParent", false);
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

    /** Inline error surfaced in the open picker when the API did not save a move. */
    private static readonly MOVE_NOT_SAVED_MESSAGE =
        "That move could not be saved, so nothing changed. Try again.";

    /**
     * Apply the author's confirmed move: the edit service moves the node,
     * saves it, and restores the tree if the save fails.
     *
     * On success the picker closes and focus returns to the moved row's Action
     * Menu button; the toast and announcement follow the save, not the click.
     *
     * On failure the hierarchy is back to what it was; we keep the picker OPEN
     * with an inline error so the author can retry or cancel. The exception is
     * a half-applied save, where the hierarchy is reloaded from the server and
     * the picker (now showing a stale tree) is closed. Confirmed moves append
     * as the last child.
     */
    private applyMove(nodeId: string, targetId: string): void {
        this.persist(this.editService.move(nodeId, targetId), {
            onSuccess: (outcome) => {
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
                this.announceMoved(outcome);
            },
            onFailure: (error) => {
                if (error.reason === "busy") {
                    return;
                }
                if (error.reloadRequired) {
                    this.closeMovePicker(false);
                    this.toastFailure(error, "move");

                    return;
                }
                // Rejected or unsaved move: hierarchy untouched, picker stays
                // open with an error.
                if (this.movePickerRef) {
                    this.movePickerRef.instance.errorMessage =
                        error.reason === "failed"
                            ? HierarchyTreeComponent.MOVE_NOT_SAVED_MESSAGE
                            : HierarchyTreeComponent.MOVE_FAILED_MESSAGE;
                    this.movePickerRef.changeDetectorRef.detectChanges();
                }
            },
        });
    }

    /** Both interaction paths report success only after the move was saved. */
    private announceMoved(outcome: HierarchyEditOutcome): void {
        const message = `“${outcome.name}” moved under “${outcome.parentName}”.`;
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

/** How many nodes sit below `node` (all levels, not counting `node`). */
function countDescendants(node: HierarchyNode): number {
    return node.children.reduce(
        (total, child) => total + 1 + countDescendants(child),
        0,
    );
}
