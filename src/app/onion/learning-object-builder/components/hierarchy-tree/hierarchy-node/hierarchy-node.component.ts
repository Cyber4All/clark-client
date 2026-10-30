import { NgClass, NgFor, NgIf, TitleCasePipe } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
    CdkDrag,
    CdkDragHandle,
    CdkDragMove,
    CdkDragStart,
} from "@angular/cdk/drag-drop";
import {
    animate,
    animateChild,
    query,
    style,
    transition,
    trigger,
} from "@angular/animations";
import { MatIconButton } from "@angular/material/button";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { LearningObject } from "@entity";
import {
    HierarchyNode,
    NodeAction,
    NodeActionId,
} from "../hierarchy-tree.types";

/**
 * Expand/collapse animation for a branch's children.
 *
 * Children are added/removed from the DOM via *ngIf, so this animates the
 * :enter and :leave of the `.node-children` block: height + opacity for a
 * smooth reveal/hide, and `animateChild()` so nested branches animate in turn.
 */
export const branchExpand = trigger("branchExpand", [
    transition(":enter", [
        style({ height: 0, opacity: 0, overflow: "hidden" }),
        animate("200ms ease", style({ height: "*", opacity: 1 })),
        query("@branchExpand", animateChild(), { optional: true }),
    ]),
    transition(":leave", [
        style({ height: "*", opacity: 1, overflow: "hidden" }),
        animate("180ms ease", style({ height: 0, opacity: 0 })),
    ]),
]);

/**
 * FontAwesome icon per length, matching the CLARK home-page hierarchy badges
 * (course = book, micro/module/unit = cubes, nano = file lines).
 */
const LENGTH_BADGE_ICON: Record<LearningObject.Length, string> = {
    [LearningObject.Length.COURSE]: "fa-solid fa-book-open",
    [LearningObject.Length.UNIT]: "fa-solid fa-cubes",
    [LearningObject.Length.MODULE]: "fa-solid fa-cubes",
    [LearningObject.Length.MICROMODULE]: "fa-solid fa-cubes",
    [LearningObject.Length.NANOMODULE]: "fa-regular fa-file-alt",
};

/**
 * Recursive presentation component for a single node (and its subtree) in the
 * Builder Hierarchy tree (sc-40233).
 *
 * Rendering follows the epic mock (`add_child_choice.png`): a type icon, a
 * color-coded length pill, the name, a drag handle, and a `+` action for
 * editable nodes; a link icon + "Linked" label for linked/read-only nodes. All
 * data is mock/local and all interaction is emitted upward — this component
 * performs no API calls and owns no persisted state.
 *
 * Drag-and-drop (rebuilt): this component owns NO `cdkDropList`. The whole tree
 * is a single drop list (on the container); each node's card is a `cdkDrag`
 * that registers with that one list via the injector. This component only
 * reports drag lifecycle (`dragActive`) and live pointer position
 * (`dragMoved`) upward; the tree container resolves the drop target by
 * hit-testing and performs the move. Whether this node is a valid destination
 * for the in-flight drag is decided by {@link canDropPredicate}, and which node
 * the pointer is currently over is pushed down via {@link hoveredTargetId}.
 */
@Component({
    selector: "clark-hierarchy-node",
    templateUrl: "./hierarchy-node.component.html",
    styleUrls: ["./hierarchy-node.component.scss"],
    standalone: true,
    animations: [branchExpand],
    imports: [
        NgIf,
        NgFor,
        NgClass,
        TitleCasePipe,
        CdkDrag,
        CdkDragHandle,
        MatIconButton,
        MatMenu,
        MatMenuItem,
        MatMenuTrigger,
    ],
})
export class HierarchyNodeComponent {
    /** The node this component renders. */
    @Input() node: HierarchyNode;

    /** Nesting depth, used for indentation. The root is depth 0. */
    @Input() depth = 0;

    /** True for the root learning object, which renders as a distinct banner row. */
    @Input() isRoot = false;

    /**
     * Predicate deciding whether `dragged` may be dropped onto `target`.
     * Provided by the tree container (delegates to the view service).
     */
    @Input() canDropPredicate: (
        dragged: HierarchyNode,
        target: HierarchyNode,
    ) => boolean = () => false;

    /**
     * Predicate deciding whether a node may be MOVED (dragged). Provided by the
     * tree container (delegates to the view service). Distinct from editability:
     * a linked root is movable but not editable, while a node inside a linked
     * subtree is neither.
     */
    @Input() canMovePredicate: (nodeId: string) => boolean = () => false;

    /** Emitted when the user toggles this node's expand/collapse chevron. */
    @Output() toggleExpanded = new EventEmitter<string>();

    /** Emitted when the author selects an item from this node's Action Menu. */
    @Output() menuAction = new EventEmitter<{
        actionId: NodeActionId;
        nodeId: string;
    }>();

    /** Emitted with the dragged node when a drag starts (null when it ends). */
    @Output() dragActive = new EventEmitter<HierarchyNode | null>();

    /** Emitted on every drag move so the tree can hit-test the pointer. */
    @Output() dragMoved = new EventEmitter<CdkDragMove<HierarchyNode>>();

    /**
     * The node currently being dragged anywhere in the tree (or null). Supplied
     * by the tree container so every node can show whether it is a valid drop
     * target for the in-flight drag. Drives the valid/invalid drag affordances.
     */
    @Input() draggingNode: HierarchyNode | null = null;

    /**
     * The id of the node the drag pointer is currently over AND which is a valid
     * destination, or null. Supplied by the tree container (which hit-tests the
     * pointer). When it matches this node, the node shows the valid-target
     * highlight.
     */
    @Input() hoveredTargetId: string | null = null;

    menuOpened: boolean = false;

    /** FontAwesome classes for this node's length badge icon (home-page style). */
    get badgeIcon(): string {
        return LENGTH_BADGE_ICON[this.node?.length] ?? "fa-regular fa-file-alt";
    }

    get hasChildren(): boolean {
        return !!this.node?.children?.length;
    }

    get isExpanded(): boolean {
        return !!this.node?.expanded;
    }

    /** True while a drag is in flight anywhere in the tree. */
    get isDragInFlight(): boolean {
        return !!this.draggingNode;
    }

    /** True when this node is the one currently being dragged. */
    get isBeingDragged(): boolean {
        return this.draggingNode?.id === this.node.id;
    }

    /**
     * Whether this node can be picked up and dragged. True for editable nodes
     * and linked roots; false for the tree root and for nodes inside a linked
     * subtree. Drives `cdkDragDisabled` and whether a drag handle is shown.
     */
    get canMove(): boolean {
        return !this.isRoot && this.canMovePredicate(this.node.id);
    }

    /**
     * Keep Move Object visible, enabling it only when this node can move.
     * Add Child Object is reserved in the action type but is not rendered yet.
     */
    get menuActions(): NodeAction[] {
        return [
            {
                id: "move",
                label: "Move Object",
                icon: "far fa-arrows-alt",
                disabled: !this.canMove,
            },
        ];
    }

    /** Keep menu buttons attached across change detection during a click. */
    trackByActionId(_index: number, action: NodeAction): NodeActionId {
        return action.id;
    }

    /** Accessible name for this node's Action Menu trigger. */
    get actionMenuLabel(): string {
        return `Actions for ${this.node.name}`;
    }

    /**
     * Whether this node is a valid destination for the in-flight drag,
     * regardless of where the pointer currently is. True as soon as a node is
     * picked up, so every place it can go shows its "Move into" indicator at
     * once. False when there is no drag, this is the dragged node itself, or
     * this node can't accept it.
     */
    get isValidDropTarget(): boolean {
        if (!this.draggingNode || this.isBeingDragged) {
            return false;
        }

        return this.canDropPredicate(this.draggingNode, this.node);
    }

    /** True when the pointer is currently over this node during a drag. */
    get isHoveredTarget(): boolean {
        return !!this.draggingNode && this.hoveredTargetId === this.node.id;
    }

    /**
     * Drag affordance for this node during an in-flight drag:
     *   - 'valid'   -> a valid destination for the dragged node (all valid
     *                  targets show this as soon as the drag starts);
     *   - 'invalid' -> the pointer is over this node but it is NOT a valid
     *                  destination (dim/disable);
     *   - null      -> no drag in flight, or this is the dragged node itself.
     *
     * Valid targets light up tree-wide so the author can see every place the
     * node can go; the specific node under the pointer is emphasized separately
     * via {@link isHoveredTarget}.
     */
    get dropAffordance(): "valid" | "invalid" | null {
        if (!this.draggingNode || this.isBeingDragged) {
            return null;
        }
        if (this.isValidDropTarget) {
            return "valid";
        }

        // Not a valid target: only mark invalid while the pointer is over it,
        // so the whole tree doesn't dim.
        return this.isHoveredTarget ? "invalid" : null;
    }

    onDragStarted(event: CdkDragStart<HierarchyNode>): void {
        this.dragActive.emit(event.source.data ?? this.node);
    }

    onDragMoved(event: CdkDragMove<HierarchyNode>): void {
        this.dragMoved.emit(event);
    }

    onDragEnded(): void {
        this.dragActive.emit(null);
    }

    onToggle(): void {
        this.toggleExpanded.emit(this.node.id);
    }

    /** Emit the selected Action Menu intent upward for this node. */
    onMenuAction(actionId: NodeActionId): void {
        this.menuAction.emit({ actionId, nodeId: this.node.id });
    }

    /** Re-emit child events so they bubble to the tree container. */
    bubbleToggle(id: string): void {
        this.toggleExpanded.emit(id);
    }

    /** Re-emit a nested node's Action Menu intent up to the tree container. */
    bubbleMenuAction(payload: {
        actionId: NodeActionId;
        nodeId: string;
    }): void {
        this.menuAction.emit(payload);
    }

    bubbleDragActive(node: HierarchyNode | null): void {
        this.dragActive.emit(node);
    }

    bubbleDragMoved(event: CdkDragMove<HierarchyNode>): void {
        this.dragMoved.emit(event);
    }

    trackById(_index: number, node: HierarchyNode): string {
        return node.id;
    }
}
