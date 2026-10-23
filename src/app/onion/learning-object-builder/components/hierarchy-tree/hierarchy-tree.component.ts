import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from "@angular/core";
import {
    CdkDrag,
    CdkDragDrop,
    CdkDragMove,
    CdkDropList,
} from "@angular/cdk/drag-drop";
import { Observable } from "rxjs";
import { LearningObject } from "@entity";
import { HierarchyNodeComponent } from "./hierarchy-node/hierarchy-node.component";
import { HierarchyViewService } from "./hierarchy-view.service";
import { AddChildAction, HierarchyNode } from "./hierarchy-tree.types";

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
export class HierarchyTreeComponent implements OnInit, OnChanges {
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
        this.viewService.moveNode(dragged.id, targetId);
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

    onAddChild(_event: { action: AddChildAction; parentId: string }): void {
        // Intentionally inert in sc-40233. The add affordance is shown per the
        // mock; the create-new-child flow is sc-40236 and link-existing is sc-40237.
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
