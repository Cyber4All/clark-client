import { NgClass, NgFor, NgIf, TitleCasePipe } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { A11yModule } from "@angular/cdk/a11y";
import { CdkListbox, CdkOption } from "@angular/cdk/listbox";
import { HierarchyNode, MoveDestination } from "../hierarchy-tree.types";

/** A visual row; selection eligibility is supplied by the view service. */
interface MoveHierarchyRow {
    id: string;
    name: string;
    length: HierarchyNode["length"];
    depth: number;
    ancestorLines: boolean[];
    isLast: boolean;
    hasChildren: boolean;
    editable: boolean;
    isMoving: boolean;
    movesWithSource: boolean;
    selectable: boolean;
    isCurrentParent: boolean;
    path: string[];
}

/**
 * Presentation-only destination picker for moves started from the action menu.
 * Rendered inside a CDK Overlay owned by `HierarchyTreeComponent`.
 *
 * This component is deliberately thin: it receives the moved node's display
 * name and the list of valid destinations (already computed by
 * `HierarchyViewService.validDestinations`), and it emits `confirm`/`cancel`
 * intents upward. It holds only transient destination selection state
 * — no hierarchy state, no move rules,
 * and no service injection or API calls. All truth lives in the service; the
 * tree coordinator applies the confirmed move.
 *
 * The template owns keyboard navigation and focus trapping.
 */
@Component({
    selector: "clark-hierarchy-move-picker",
    templateUrl: "./hierarchy-move-picker.component.html",
    styleUrls: ["./hierarchy-move-picker.component.scss"],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        TitleCasePipe,
        A11yModule,
        CdkListbox,
        CdkOption,
    ],
})
export class HierarchyMovePickerComponent {
    /** Name of the node being moved, shown in the picker heading. */
    @Input() movingNodeName = "";

    /** Fallback label when the moved node has no name. */
    @Input() unnamedLabel = "Unnamed object";

    /** Valid destinations to choose from, supplied by the service. */
    @Input() destinations: MoveDestination[] = [];

    /** The full hierarchy provides context, including unavailable destinations. */
    @Input() hierarchy: HierarchyNode[] = [];
    @Input() movingNodeId = "";

    get hierarchyRows(): MoveHierarchyRow[] {
        const destinations = new Map(this.destinations.map((d) => [d.id, d]));
        const roots = this.hierarchy.length
            ? this.hierarchy
            : this.destinations.map((d) => ({
                  id: d.id,
                  name: d.name,
                  length: d.length,
                  editable: true,
                  children: [],
              }));
        const rows: MoveHierarchyRow[] = [];
        const visit = (
            nodes: HierarchyNode[],
            path: string[],
            lines: boolean[],
            movingAncestor: boolean,
        ): void => {
            nodes.forEach((node, index) => {
                const isLast = index === nodes.length - 1;
                const isMoving = node.id === this.movingNodeId;
                const destination = destinations.get(node.id);
                const nextPath = [...path, node.name || this.unnamedLabel];
                rows.push({
                    id: node.id,
                    name: node.name,
                    length: node.length,
                    depth: path.length,
                    ancestorLines: lines.slice(1),
                    isLast,
                    hasChildren: node.children.length > 0,
                    editable: node.editable,
                    isMoving,
                    movesWithSource: movingAncestor,
                    selectable: !!destination && !isMoving && !movingAncestor,
                    isCurrentParent: !!destination?.isCurrentParent,
                    path: nextPath,
                });
                visit(
                    node.children,
                    nextPath,
                    [...lines, !isLast],
                    movingAncestor || isMoving,
                );
            });
        };
        visit(roots, [], [], false);
        return rows;
    }

    destinationLabel(row: MoveHierarchyRow): string {
        const context = row.path.slice(0, -1).join(" / ");
        const status = row.isMoving
            ? "Moving object"
            : row.movesWithSource
              ? "Moves with this object"
              : row.isCurrentParent
                ? "Current parent"
                : !row.selectable
                  ? "Unavailable destination"
                  : "";
        return [row.name || this.unnamedLabel, row.length, context, status]
            .filter(Boolean)
            .join(", ");
    }

    /**
     * Inline error to show while the picker stays open, e.g. when the tree
     * coordinator reports that a confirmed move could not be applied.
     * `null` hides the message.
     */
    @Input() errorMessage: string | null = null;

    /** Emitted when the author confirms a destination; the move appends there. */
    @Output() confirm = new EventEmitter<{
        targetId: string;
    }>();

    /** Emitted on cancel / Escape / outside-click. */
    @Output() cancel = new EventEmitter<void>();

    /** Currently selected destination id, or null when nothing is chosen. */
    selectedTargetId: string | null = null;

    /** True when there is at least one destination to offer. */
    get hasDestinations(): boolean {
        return this.destinations.length > 0;
    }

    /** True once a destination is selected; gates the confirm control. */
    get canConfirm(): boolean {
        return this.selectedTargetId !== null;
    }

    /** Display name of the moved node, falling back to the unnamed label. */
    get displayName(): string {
        return this.movingNodeName?.trim() || this.unnamedLabel;
    }

    /** Select a valid destination and clear any previous move error. */
    selectDestination(id: string): void {
        const row = this.hierarchyRows.find((candidate) => candidate.id === id);
        if (!row?.selectable) {
            return;
        }
        if (id !== this.selectedTargetId) {
            this.selectedTargetId = id;
            // A fresh selection supersedes any prior failed-move error.
            this.errorMessage = null;
        }
    }

    /** Confirm the selected destination. */
    onConfirm(): void {
        if (!this.canConfirm) {
            return;
        }
        this.confirm.emit({
            targetId: this.selectedTargetId!,
        });
    }

    /** Cancel the move without mutating the hierarchy. */
    onCancel(): void {
        this.cancel.emit();
    }

    trackById(_index: number, destination: { id: string }): string {
        return destination.id;
    }
}
