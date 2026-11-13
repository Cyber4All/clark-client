import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { A11yModule } from "@angular/cdk/a11y";

/**
 * Confirmation shown before a child is removed from a hierarchy (sc-40642).
 * Rendered inside a CDK Overlay owned by `HierarchyTreeComponent`, like the
 * Move picker.
 *
 * Presentation only: it receives names to display and emits `confirm` or
 * `cancel`. The tree coordinator performs the removal. Removing only unlinks
 * the child from this parent; the learning object stays in the author's
 * library, and the text says so.
 */
@Component({
    selector: "clark-hierarchy-remove-confirm",
    templateUrl: "./hierarchy-remove-confirm.component.html",
    styleUrls: ["./hierarchy-remove-confirm.component.scss"],
    standalone: true,
    imports: [NgIf, A11yModule],
})
export class HierarchyRemoveConfirmComponent {
    /** Name of the child being removed. */
    @Input() nodeName = "";

    /** Name of the parent it is being removed from. */
    @Input() parentName = "";

    /** Fallback label when a name is empty. */
    @Input() unnamedLabel = "Unnamed object";

    /**
     * How many objects sit inside the child (all levels). They leave this
     * hierarchy together with it, so the author is told.
     */
    @Input() descendantCount = 0;

    /** Emitted when the author confirms the removal. */
    @Output() confirm = new EventEmitter<void>();

    /** Emitted on Cancel, Escape, or an outside click. */
    @Output() cancel = new EventEmitter<void>();

    get displayNodeName(): string {
        return this.nodeName?.trim() || this.unnamedLabel;
    }

    get displayParentName(): string {
        return this.parentName?.trim() || this.unnamedLabel;
    }

    /** "1 object" / "3 objects". */
    get descendantLabel(): string {
        return this.descendantCount === 1
            ? "1 object"
            : `${this.descendantCount} objects`;
    }

    onConfirm(): void {
        this.confirm.emit();
    }

    onCancel(): void {
        this.cancel.emit();
    }
}
