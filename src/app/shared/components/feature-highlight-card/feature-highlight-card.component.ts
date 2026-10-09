import { Component, EventEmitter, Output, input } from "@angular/core";

export interface FeatureHighlightAction {
    label: string;
    ariaLabel?: string;
    disabled?: boolean;
}

export type FeatureHighlightAppearance = "inline" | "floating";

export interface FeatureHighlightConfig {
    title: string;
    body: string;
    appearance?: FeatureHighlightAppearance;
    iconClass?: string;
    iconLabel?: string;
    primaryAction?: FeatureHighlightAction;
    secondaryAction?: FeatureHighlightAction;
    dismissible?: boolean;
    dismissLabel?: string;
}

@Component({
    selector: "clark-feature-highlight-card",
    templateUrl: "./feature-highlight-card.component.html",
    styleUrls: ["./feature-highlight-card.component.scss"],
    standalone: true,
})
export class FeatureHighlightCardComponent {
    private static nextId = 0;

    readonly config = input<FeatureHighlightConfig>({
        title: "",
        body: "",
        appearance: "inline",
        dismissible: true,
        dismissLabel: "Dismiss",
    });

    @Output() primaryActionSelected = new EventEmitter<void>();
    @Output() secondaryActionSelected = new EventEmitter<void>();
    @Output() dismissed = new EventEmitter<void>();

    readonly titleId = `feature-highlight-card-title-${FeatureHighlightCardComponent.nextId++}`;
    readonly bodyId = `feature-highlight-card-body-${FeatureHighlightCardComponent.nextId++}`;

    get title(): string {
        return this.config().title;
    }

    get body(): string {
        return this.config().body;
    }

    get iconClass(): string | undefined {
        return this.config().iconClass;
    }

    get iconLabel(): string | undefined {
        return this.config().iconLabel;
    }

    get primaryAction(): FeatureHighlightAction | undefined {
        return this.config().primaryAction;
    }

    get secondaryAction(): FeatureHighlightAction | undefined {
        return this.config().secondaryAction;
    }

    get dismissible(): boolean {
        return this.config().dismissible ?? true;
    }

    get dismissLabel(): string {
        return this.config().dismissLabel ?? "Dismiss";
    }

    get isFloating(): boolean {
        return this.config().appearance === "floating";
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
