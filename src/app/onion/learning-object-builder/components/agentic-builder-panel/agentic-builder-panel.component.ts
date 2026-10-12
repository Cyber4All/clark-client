import { NgClass, NgFor, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Output } from "@angular/core";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { ActivateDirective } from "../../../../shared/directives/activate.directive";
import { PillComponent } from "../../../../shared/components/pill/pill.component";
import { ClickOutsideModule } from "ng-click-outside";
import { TextDiffComponent } from "./text-diff/text-diff.component";
import { AgenticBuilderField, BuilderStore } from "../../builder-store.service";
import type { AgenticBuilderSuggestions } from "app/core/learning-object-module/learning-object/learning-object.types";

type AgenticSuggestionStatus = "pending" | "accepted" | "rejected";

@Component({
    selector: "onion-agentic-builder-panel",
    templateUrl: "./agentic-builder-panel.component.html",
    styleUrls: ["./agentic-builder-panel.component.scss"],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        ActivateDirective,
        PillComponent,
        ClickOutsideModule,
        TextDiffComponent,
    ],
})
export class AgenticBuilderPanelComponent {
    @Output() closed = new EventEmitter<void>();

    generating = false;
    reviewing = false;
    errorMessage: string | null = null;
    suggestions: AgenticBuilderSuggestions | null = null;
    fieldStatuses: Record<"name" | "description", AgenticSuggestionStatus> = {
        name: "pending",
        description: "pending",
    };
    outcomeStatuses: Record<number, AgenticSuggestionStatus> = {};
    expandedSections: Record<"name" | "description" | "outcomes", boolean> = {
        name: true,
        description: true,
        outcomes: true,
    };
    selectedFields = {
        name: true,
        description: true,
        learningOutcomes: true,
    };

    constructor(
        private store: BuilderStore,
        private learningObjectService: LearningObjectService,
        private toasterService: ToastrOvenService,
    ) {}

    toggleField(field: keyof typeof this.selectedFields): void {
        this.selectedFields[field] = !this.selectedFields[field];
    }

    get hasSelectedFields(): boolean {
        return Object.values(this.selectedFields).some(Boolean);
    }

    close(): void {
        if (!this.generating && this.canDiscardReview()) {
            this.resetReview();
            this.closed.emit();
        }
    }

    handleClickOutside(): void {
        if (!this.reviewing && !this.generating) {
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
            this.fieldStatuses = {
                name: "pending",
                description: "pending",
            };
            this.outcomeStatuses = Object.fromEntries(
                (this.suggestions.learningOutcomes || []).map(
                    (_outcome, index) => [index, "pending"],
                ),
            );
            this.expandedSections = {
                name: true,
                description: !this.descriptionSuggestionIsLong,
                outcomes: true,
            };
            this.reviewing = true;
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
            this.toasterService.error("Generation failed", this.errorMessage);
        } finally {
            this.generating = false;
            this.store.clearAgenticGeneration();
        }
    }

    get currentName(): string {
        return this.store.learningObject?.name || "";
    }

    get currentDescription(): string {
        return this.store.learningObject?.description || "";
    }

    get currentOutcomes() {
        return this.store.currentOutcomes;
    }

    get hasNameSuggestion(): boolean {
        return (
            this.suggestions?.name !== undefined &&
            this.suggestions.name !== this.currentName
        );
    }

    get hasDescriptionSuggestion(): boolean {
        return (
            this.suggestions?.description !== undefined &&
            this.suggestions.description !== this.currentDescription
        );
    }

    get descriptionSuggestionIsLong(): boolean {
        return (this.suggestions?.description?.length || 0) > 240;
    }

    get suggestionCount(): number {
        if (!this.suggestions) return 0;
        return (
            (this.hasNameSuggestion ? 1 : 0) +
            (this.hasDescriptionSuggestion ? 1 : 0) +
            (this.suggestions.learningOutcomes?.length || 0)
        );
    }

    get reviewedCount(): number {
        const fieldCount = Object.values(this.fieldStatuses).filter(
            (status) => status !== "pending",
        ).length;
        const outcomeCount = Object.values(this.outcomeStatuses).filter(
            (status) => status !== "pending",
        ).length;
        return fieldCount + outcomeCount;
    }

    get acceptedCount(): number {
        const fieldCount = Object.values(this.fieldStatuses).filter(
            (status) => status === "accepted",
        ).length;
        const outcomeCount = Object.values(this.outcomeStatuses).filter(
            (status) => status === "accepted",
        ).length;
        return fieldCount + outcomeCount;
    }

    get hasSuggestions(): boolean {
        return this.suggestionCount > 0;
    }

    get contextMaterialCount(): number {
        return (
            this.store.learningObject?.materials?.files?.filter(
                (file) => file.context,
            ).length || 0
        );
    }

    toggleSection(section: "name" | "description" | "outcomes"): void {
        this.expandedSections[section] = !this.expandedSections[section];
    }

    setFieldStatus(
        field: "name" | "description",
        status: AgenticSuggestionStatus,
    ): void {
        this.fieldStatuses[field] = status;
    }

    setOutcomeStatus(index: number, status: "accepted" | "rejected"): void {
        this.outcomeStatuses[index] = status;
    }

    acceptAllOutcomes(): void {
        (this.suggestions?.learningOutcomes || []).forEach(
            (_outcome, index) => {
                this.outcomeStatuses[index] = "accepted";
            },
        );
    }

    async applySelectedChanges(): Promise<void> {
        if (!this.suggestions || this.generating) return;

        this.generating = true;
        try {
            const acceptedFields = new Set<"name" | "description">();
            if (this.fieldStatuses.name === "accepted") {
                acceptedFields.add("name");
            }
            if (this.fieldStatuses.description === "accepted") {
                acceptedFields.add("description");
            }

            const acceptedOutcomeIndexes = new Set(
                Object.entries(this.outcomeStatuses)
                    .filter(([, status]) => status === "accepted")
                    .map(([index]) => Number(index)),
            );

            const acceptedCount = this.acceptedCount;
            await this.store.applyAgenticSuggestions(
                this.suggestions,
                acceptedFields,
                acceptedOutcomeIndexes,
            );
            this.toasterService.success(
                "Suggestions applied",
                `${acceptedCount} suggestion${acceptedCount === 1 ? "" : "s"} added to your learning object.`,
            );
            this.resetReview();
            this.closed.emit();
        } catch (error) {
            this.toasterService.error(
                "Unable to apply suggestions",
                this.getErrorMessage(error),
            );
        } finally {
            this.generating = false;
        }
    }

    resetReview(): void {
        this.reviewing = false;
        this.suggestions = null;
        this.outcomeStatuses = {};
        this.fieldStatuses = { name: "pending", description: "pending" };
    }

    private canDiscardReview(): boolean {
        return (
            !this.reviewing ||
            !this.reviewedCount ||
            window.confirm(
                "Discard your review decisions? No suggestions will be applied.",
            )
        );
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
