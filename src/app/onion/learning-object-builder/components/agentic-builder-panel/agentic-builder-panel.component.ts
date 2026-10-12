import { NgFor, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Output,
} from "@angular/core";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { PillComponent } from "../../../../shared/components/pill/pill.component";
import { AgenticBuilderField, BuilderStore } from "../../builder-store.service";
import type { AgenticBuilderSuggestions } from "app/core/learning-object-module/learning-object/learning-object.types";

@Component({
    selector: "onion-agentic-builder-panel",
    templateUrl: "./agentic-builder-panel.component.html",
    styleUrls: ["./agentic-builder-panel.component.scss"],
    standalone: true,
    imports: [NgIf, NgFor, PillComponent],
})
export class AgenticBuilderPanelComponent {
    @Output() closed = new EventEmitter<void>();

    generating = false;
    private reviewActionInProgress = false;
    reviewing = false;
    errorMessage: string | null = null;
    suggestions: AgenticBuilderSuggestions | null = null;
    selectedFields = {
        name: true,
        description: true,
        learningOutcomes: true,
    };

    constructor(
        private store: BuilderStore,
        private learningObjectService: LearningObjectService,
        private toasterService: ToastrOvenService,
        private elementRef: ElementRef<HTMLElement>,
    ) {}

    toggleField(field: keyof typeof this.selectedFields): void {
        this.selectedFields[field] = !this.selectedFields[field];
    }

    get hasSelectedFields(): boolean {
        return Object.values(this.selectedFields).some(Boolean);
    }

    close(): void {
        if (!this.generating && !this.reviewActionInProgress) {
            this.resetReview();
            this.closed.emit();
        }
    }

    @HostListener("document:click", ["$event"])
    handleDocumentClick(event: MouseEvent): void {
        const target = event.target;
        const clickedInside =
            target instanceof Node &&
            this.elementRef.nativeElement.contains(target);

        if (
            !clickedInside &&
            !this.generating &&
            !this.reviewActionInProgress
        ) {
            this.close();
        }
    }

    @HostListener("document:keydown.escape")
    handleEscape(): void {
        if (!this.generating && !this.reviewActionInProgress) {
            this.close();
        }
    }

    async generate(): Promise<void> {
        if (this.generating) return;

        const learningObject = this.store.learningObject;
        const learningObjectId = learningObject?.id;
        const fields = Object.entries(this.selectedFields)
            .filter(([, selected]) => selected)
            .map(([field]) => field) as AgenticBuilderField[];

        if (!learningObjectId || !learningObject?.cuid || !fields.length) {
            this.toasterService.warning(
                "Select content to generate",
                "Choose at least one field before generating.",
            );
            return;
        }

        this.generating = true;
        this.errorMessage = null;
        this.store.setAgenticGeneration(fields);

        try {
            const suggestions =
                await this.learningObjectService.buildLearningObject(
                    learningObjectId,
                    { fields },
                );
            this.suggestions = suggestions || {};
            this.reviewing = true;
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
            this.toasterService.error("Generation failed", this.errorMessage);
        } finally {
            this.generating = false;
            this.store.clearAgenticGeneration();
        }
    }

    get hasNameSuggestion(): boolean {
        return this.suggestions?.name !== undefined;
    }

    get hasDescriptionSuggestion(): boolean {
        return this.suggestions?.description !== undefined;
    }

    get suggestionCount(): number {
        if (!this.suggestions) return 0;
        return (
            (this.hasNameSuggestion ? 1 : 0) +
            (this.hasDescriptionSuggestion ? 1 : 0) +
            (this.suggestions.learningOutcomes?.length || 0)
        );
    }

    get hasSuggestions(): boolean {
        return this.suggestionCount > 0;
    }

    stopDismissal(event: Event): void {
        event.stopPropagation();
    }

    get contextMaterialCount(): number {
        return (
            this.store.learningObject?.materials?.files?.filter(
                (file) => file.context,
            ).length || 0
        );
    }

    async acceptField(field: "name" | "description"): Promise<void> {
        if (!this.suggestions || this.generating) return;
        const value = this.suggestions[field];
        if (value === undefined) return;

        await this.applySuggestions({ [field]: value }, () =>
            this.removeField(field),
        );
    }

    rejectField(field: "name" | "description"): void {
        if (!this.suggestions) return;
        this.suggestions = { ...this.suggestions, [field]: undefined };
    }

    async acceptOutcome(index: number): Promise<void> {
        if (!this.suggestions || this.generating) return;
        const outcome = this.suggestions.learningOutcomes?.[index];
        if (!outcome) return;

        await this.applySuggestions({ learningOutcomes: [outcome] }, () =>
            this.removeOutcome(index),
        );
    }

    rejectOutcome(index: number): void {
        this.removeOutcome(index);
    }

    async acceptAll(): Promise<void> {
        if (!this.suggestions || this.generating) return;

        for (const field of ["name", "description"] as const) {
            if (this.suggestions?.[field] === undefined) continue;
            const value = this.suggestions[field];
            await this.applySuggestions({ [field]: value }, () =>
                this.removeField(field),
            );
            if (this.suggestions?.[field] !== undefined) return;
        }

        while (this.suggestions?.learningOutcomes?.length) {
            const outcome = this.suggestions.learningOutcomes[0];
            await this.applySuggestions({ learningOutcomes: [outcome] }, () =>
                this.removeOutcome(0),
            );
            if (this.suggestions?.learningOutcomes?.[0] === outcome) return;
        }

        this.resetReview();
        this.closed.emit();
    }

    private async applySuggestions(
        suggestions: AgenticBuilderSuggestions,
        onSuccess: () => void,
    ): Promise<void> {
        this.generating = true;
        this.reviewActionInProgress = true;
        try {
            const acceptedFields = new Set<"name" | "description">();
            if (suggestions.name !== undefined) acceptedFields.add("name");
            if (suggestions.description !== undefined) {
                acceptedFields.add("description");
            }
            const acceptedOutcomeIndexes = new Set(
                (suggestions.learningOutcomes || []).map(
                    (_outcome, index) => index,
                ),
            );
            await this.store.applyAgenticSuggestions(
                suggestions,
                acceptedFields,
                acceptedOutcomeIndexes,
            );
            onSuccess();
        } catch (error) {
            this.toasterService.error(
                "Unable to apply suggestion",
                this.getErrorMessage(error),
            );
        } finally {
            this.generating = false;
            this.reviewActionInProgress = false;
        }
    }

    private removeOutcome(index: number): void {
        if (!this.suggestions?.learningOutcomes) return;
        this.suggestions = {
            ...this.suggestions,
            learningOutcomes: this.suggestions.learningOutcomes.filter(
                (_outcome, outcomeIndex) => outcomeIndex !== index,
            ),
        };
    }

    private removeField(field: "name" | "description"): void {
        if (!this.suggestions) return;
        this.suggestions = { ...this.suggestions, [field]: undefined };
    }

    resetReview(): void {
        this.reviewing = false;
        this.suggestions = null;
    }

    private getErrorMessage(error: unknown): string {
        const fallback =
            "We could not generate this learning object. Please try again.";
        const response =
            error instanceof HttpErrorResponse ? error.error : error;

        return this.findMessage(response) ?? fallback;
    }

    private findMessage(value: unknown): string | undefined {
        if (typeof value === "string") {
            const message = value.trim();
            if (!message) return undefined;

            try {
                return this.findMessage(JSON.parse(message)) ?? message;
            } catch (_error) {
                return message;
            }
        }

        if (Array.isArray(value)) {
            return value
                .map((item) => this.findMessage(item))
                .filter(Boolean)
                .join(" ");
        }

        if (value && typeof value === "object") {
            const response = value as Record<string, unknown>;
            for (const property of ["message", "detail", "details", "error"]) {
                const message = this.findMessage(response[property]);
                if (message) return message;
            }
        }

        return undefined;
    }
}
