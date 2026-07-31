import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

export interface FeatureHighlightAction {
    label: string;
    ariaLabel?: string;
    disabled?: boolean;
}

export type FeatureHighlightAppearance = "inline" | "floating";

@Component({
    selector: "clark-feature-highlight-card",
    templateUrl: "./feature-highlight-card.component.html",
    styleUrls: ["./feature-highlight-card.component.scss"],
    standalone: true,
    imports: [NgIf],
})
export class FeatureHighlightCardComponent {
    private static nextId = 0;

    @Input() title = "";
    @Input() body = "";
    @Input() appearance: FeatureHighlightAppearance = "inline";
    @Input() iconClass?: string;
    @Input() iconLabel?: string;
    @Input() primaryAction?: FeatureHighlightAction;
    @Input() secondaryAction?: FeatureHighlightAction;
    @Input() dismissible = true;
    @Input() dismissLabel = "Dismiss";

    @Output() primaryActionSelected = new EventEmitter<void>();
    @Output() secondaryActionSelected = new EventEmitter<void>();
    @Output() dismissed = new EventEmitter<void>();

    readonly titleId = `feature-highlight-card-title-${FeatureHighlightCardComponent.nextId++}`;
    readonly bodyId = `feature-highlight-card-body-${FeatureHighlightCardComponent.nextId++}`;

    get isFloating(): boolean {
        return this.appearance === "floating";
    }

    get hasIcon(): boolean {
        return !!this.iconClass;
    }

    get hasPrimaryAction(): boolean {
        return !!this.primaryAction?.label;
    }

    get hasSecondaryAction(): boolean {
        return !!this.secondaryAction?.label;
    }

    onPrimaryAction(): void {
        if (!this.primaryAction?.disabled) {
            this.primaryActionSelected.emit();
        }
    }

    onSecondaryAction(): void {
        if (!this.secondaryAction?.disabled) {
            this.secondaryActionSelected.emit();
        }
    }

    onDismiss(): void {
        this.dismissed.emit();
    }
}
