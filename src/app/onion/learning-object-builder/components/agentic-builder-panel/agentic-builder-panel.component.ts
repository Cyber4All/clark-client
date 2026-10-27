import { NgFor, NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    HostListener,
    Output,
    inject,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { AgenticOutcomeSuggestion } from "app/core/learning-object-module/learning-object/learning-object.types";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { PillComponent } from "../../../../shared/components/pill/pill.component";
import { TipDirective } from "../../../../shared/directives/tip.directive";
import { AgenticBuilderField, BuilderStore } from "../../builder-store.service";
import type { AgenticBuilderSuggestions } from "app/core/learning-object-module/learning-object/learning-object.types";
import {
    AgenticBuilderSessionStorageService,
    AgenticBuilderSessionState,
} from "./agentic-builder-session-storage.service";

const DESCRIPTION_BATCH_SIZE = 2;
const MAX_DESCRIPTION_LENGTH = 1500;

type ReviewField = "name" | "description";

@Component({
    selector: "onion-agentic-builder-panel",
    templateUrl: "./agentic-builder-panel.component.html",
    styleUrls: ["./agentic-builder-panel.component.scss"],
    standalone: true,
    imports: [NgIf, NgFor, PillComponent, TipDirective],
})
export class AgenticBuilderPanelComponent {
    @Output() closed = new EventEmitter<void>();

    private readonly destroyRef = inject(DestroyRef);
    applying = false;

    reviewing = false;
    hasGeneratedSuggestions = false;
    errorMessage: string | null = null;
    selectedFields: Record<AgenticBuilderField, boolean> = {
        name: true,
        description: true,
        learningOutcomes: true,
    };

    hasGeneratedOutcomes = false;

    readonly loading: Record<AgenticBuilderField, boolean> = {
        name: false,
        description: false,
        learningOutcomes: false,
    };
    readonly sectionErrors: Record<AgenticBuilderField, string | null> = {
        name: null,
        description: null,
        learningOutcomes: null,
    };

    nameSuggestion: string | null = null;
    appliedName = false;
    private appliedNameValue: string | null = null;

    descriptionOptions: string[] = [];
    descriptionIndex = 0;
    appliedDescriptionIndex: number | null = null;
    private appliedDescriptionValue: string | null = null;

    outcomeSuggestions: AgenticOutcomeSuggestion[] = [];

    constructor(
        private store: BuilderStore,
        private learningObjectService: LearningObjectService,
        private toasterService: ToastrOvenService,
        private elementRef: ElementRef<HTMLElement>,
        private sessionStorage: AgenticBuilderSessionStorageService,
    ) {
        this.store.learningObjectEvent
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((learningObject) => {
                if (!learningObject?.cuid) return;

                if (learningObject.cuid !== this.activeCuid) {
                    this.restoreSession(learningObject.cuid, learningObject);
                    return;
                }

                if (
                    this.appliedNameValue !== null &&
                    learningObject.name !== this.appliedNameValue
                ) {
                    this.appliedNameValue = null;
                    this.appliedName = false;
                }
                if (
                    this.appliedDescriptionValue !== null &&
                    learningObject.description !== this.appliedDescriptionValue
                ) {
                    this.appliedDescriptionValue = null;
                    this.appliedDescriptionIndex = null;
                }
                this.persistSession();
            });
    }

    private activeCuid: string | null = null;

    /** Toggles whether a field is included in the next suggestion request. */
    toggleField(field: AgenticBuilderField): void {
        if (this.anyLoading) return;
        this.selectedFields[field] = !this.selectedFields[field];
        this.persistSession();
    }

    /** Whether at least one suggestion field is selected. */
    get hasSelectedFields(): boolean {
        return Object.values(this.selectedFields).some(Boolean);
    }

    /** Whether any suggestion request is currently in progress. */
    get anyLoading(): boolean {
        return Object.values(this.loading).some(Boolean);
    }

    /** Returns the description currently selected for review, if available. */
    get currentDescription(): string | null {
        return this.descriptionOptions[this.descriptionIndex] ?? null;
    }

    /** Closes the panel and preserves its current review state for this session. */
    close(): void {
        if (this.applying) return;
        this.reviewing = this.hasGeneratedSuggestions;
        this.persistSession();
        this.closed.emit();
    }

    /** Closes the panel when a click occurs outside it, unless an apply is running. */
    @HostListener("document:click", ["$event"])
    handleDocumentClick(event: MouseEvent): void {
        const target = event.target;
        const clickedInside =
            target instanceof Node &&
            this.elementRef.nativeElement.contains(target);

        if (!clickedInside && !this.applying) this.close();
    }

    /** Closes the panel on Escape unless an apply is running. */
    @HostListener("document:keydown.escape")
    handleEscape(): void {
        if (!this.applying) this.close();
    }

    /** Generates suggestions for all selected fields and enters review when available. */
    async generateSelected(): Promise<void> {
        if (this.anyLoading) return;
        const fields = (
            Object.keys(this.selectedFields) as AgenticBuilderField[]
        ).filter((field) => this.selectedFields[field]);

        if (!fields.length) {
            this.toasterService.warning(
                "Select content to generate",
                "Choose at least one field before generating.",
            );
            return;
        }

        this.errorMessage = null;
        await Promise.all(
            fields.map((field) => this.generateMoreSuggestions(field)),
        );
        this.reviewing = this.hasGeneratedSuggestions;
        this.persistSession();
    }

    /** Requests another batch of suggestions for one field and records any error. */
    async generateMoreSuggestions(field: AgenticBuilderField): Promise<void> {
        if (this.loading[field]) return;
        const learningObjectId = this.store.learningObject?.id;
        if (!learningObjectId) {
            this.sectionErrors[field] =
                "The learning object is not ready. Try again in a moment.";
            return;
        }

        this.loading[field] = true;
        this.sectionErrors[field] = null;
        this.store.setAgenticGeneration([field]);

        try {
            if (field === "name")
                await this.generateSuggestedName(learningObjectId);
            if (field === "description") {
                await this.generateSuggestedDescriptionBatch(learningObjectId);
            }
            if (field === "learningOutcomes") {
                await this.generateSuggestedOutcomeBatch(learningObjectId);
            }
        } catch (error) {
            this.sectionErrors[field] =
                `Suggestions could not be generated. ${this.getErrorMessage(error)}`;
        } finally {
            this.loading[field] = false;
            this.store.clearAgenticGeneration();
            this.persistSession();
        }
    }

    /** Requests and stores one valid name suggestion for the learning object. */
    private async generateSuggestedName(
        learningObjectId: string,
    ): Promise<void> {
        const response = await this.learningObjectService.buildLearningObject(
            learningObjectId,
            { fields: ["name"] },
        );
        const suggestion = this.normalizeSuggestedName(response?.name);
        if (!suggestion) {
            throw new Error("The generated title was empty or invalid.");
        }
        this.nameSuggestion = suggestion;
        this.appliedName = false;
        this.hasGeneratedSuggestions = true;
    }

    /** Requests a batch of descriptions, retaining valid results and reporting partial failures. */
    private async generateSuggestedDescriptionBatch(
        learningObjectId: string,
    ): Promise<void> {
        const responses = await Promise.allSettled(
            Array.from({ length: DESCRIPTION_BATCH_SIZE }, () =>
                this.learningObjectService.buildLearningObject(
                    learningObjectId,
                    {
                        fields: ["description"],
                    },
                ),
            ),
        );
        const validOptions: string[] = [];
        let failed = false;

        for (const response of responses) {
            if (response.status === "rejected") {
                failed = true;
                continue;
            }
            const value = response.value?.description;
            if (
                typeof value === "string" &&
                value.trim().length > 0 &&
                value.length <= MAX_DESCRIPTION_LENGTH
            ) {
                validOptions.push(value);
            } else {
                failed = true;
            }
        }

        if (!this.descriptionOptions.length && validOptions.length) {
            this.descriptionIndex = 0;
        }
        this.descriptionOptions = [...this.descriptionOptions, ...validOptions];
        if (validOptions.length) this.hasGeneratedSuggestions = true;
        if (failed) {
            this.sectionErrors.description =
                "Some descriptions were invalid or could not be generated. Generate more to retry.";
        }
    }

    /** Requests learning outcomes, appends valid results, and reports invalid or failed responses. */
    private async generateSuggestedOutcomeBatch(
        learningObjectId: string,
    ): Promise<void> {
        try {
            const response =
                await this.learningObjectService.buildLearningObject(
                    learningObjectId,
                    { fields: ["learningOutcomes"] },
                );
            const generated = response?.learningOutcomes;
            if (!Array.isArray(generated)) {
                this.sectionErrors.learningOutcomes =
                    "Learning outcomes could not be generated. Generate more to retry.";
                return;
            }

            const validOptions = generated.filter((outcome) =>
                this.isValidOutcome(outcome),
            );
            this.outcomeSuggestions = [
                ...this.outcomeSuggestions,
                ...validOptions,
            ];
            if (validOptions.length) {
                this.hasGeneratedSuggestions = true;
                this.hasGeneratedOutcomes = true;
            }
            if (validOptions.length !== generated.length) {
                this.sectionErrors.learningOutcomes =
                    "Some learning outcomes were invalid. Generate more to retry.";
            }
        } catch (_error) {
            this.sectionErrors.learningOutcomes =
                "Learning outcomes could not be generated. Generate more to retry.";
        }
    }

    /** Moves the selected description back by one, stopping at the first option. */
    previousDescription(): void {
        this.descriptionIndex = Math.max(0, this.descriptionIndex - 1);
        this.persistSession();
    }

    /** Moves the selected description forward by one, stopping at the last option. */
    nextDescription(): void {
        this.descriptionIndex = Math.min(
            this.descriptionOptions.length - 1,
            this.descriptionIndex + 1,
        );
        this.persistSession();
    }

    /** Applies the current name suggestion to the learning object. */
    async useSelectedName(): Promise<void> {
        if (this.applying) return;
        const name = this.normalizeSuggestedName(this.nameSuggestion);
        if (!name) return;
        this.nameSuggestion = name;

        await this.applySuggestion(
            { name },
            new Set(["name"]),
            new Set(),
            () => {
                this.appliedName = true;
                this.appliedNameValue = name;
            },
        );
    }

    /** Applies the description currently selected for review. */
    async useCurrentDescription(): Promise<void> {
        const index = this.descriptionIndex;
        const description = this.currentDescription;
        if (index < 0 || description === null || this.applying) return;

        await this.applySuggestion(
            { description },
            new Set(["description"]),
            new Set(),
            () => {
                this.appliedDescriptionIndex = index;
                this.appliedDescriptionValue = description;
            },
        );
    }

    /** Dismisses the name suggestion without changing the learning object's name. */
    rejectName(): void {
        if (this.applying || this.loading.name) return;
        this.nameSuggestion = null;
        this.appliedName = false;
        this.appliedNameValue = null;
        this.persistSession();
    }

    /** Dismisses the selected description and keeps remaining review indices aligned. */
    rejectCurrentDescription(): void {
        if (
            this.applying ||
            this.loading.description ||
            this.currentDescription === null
        )
            return;
        const index = this.descriptionIndex;
        this.descriptionOptions = this.descriptionOptions.filter(
            (_description, optionIndex) => optionIndex !== index,
        );
        if (this.appliedDescriptionIndex === index) {
            this.appliedDescriptionIndex = null;
            this.appliedDescriptionValue = null;
        } else if (
            this.appliedDescriptionIndex !== null &&
            this.appliedDescriptionIndex > index
        ) {
            this.appliedDescriptionIndex--;
        }
        this.descriptionIndex = Math.max(
            0,
            Math.min(index, this.descriptionOptions.length - 1),
        );
        this.persistSession();
    }

    /** Applies one suggested learning outcome and removes it after a successful apply. */
    async acceptOutcome(index: number): Promise<void> {
        if (this.applying) return;
        const outcome = this.outcomeSuggestions[index];
        if (!outcome) return;
        await this.applySuggestion(
            { learningOutcomes: [outcome] },
            new Set(),
            new Set([0]),
            () => this.removeOutcome(index),
        );
    }

    /** Removes a suggested learning outcome without applying it. */
    rejectOutcome(index: number): void {
        if (this.applying) return;
        this.removeOutcome(index);
    }

    /** Prevents an interaction inside the panel from bubbling to its dismissal handler. */
    stopDismissal(event: Event): void {
        event.stopPropagation();
    }

    /** Applies a suggestion and updates review state only after the store succeeds. */
    private async applySuggestion(
        suggestion: AgenticBuilderSuggestions,
        acceptedFields: Set<ReviewField>,
        acceptedOutcomeIndexes: Set<number>,
        onSuccess: () => void,
    ): Promise<void> {
        this.applying = true;
        try {
            await this.store.applyAgenticSuggestions(
                suggestion,
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
            this.applying = false;
            this.persistSession();
        }
    }

    /** Removes an outcome suggestion by its current position and persists the change. */
    private removeOutcome(index: number): void {
        this.outcomeSuggestions = this.outcomeSuggestions.filter(
            (_outcome, outcomeIndex) => outcomeIndex !== index,
        );
        this.persistSession();
    }

    /** Restores saved suggestions for a learning object and reconciles applied values. */
    private restoreSession(
        cuid: string,
        learningObject: { name?: string; description?: string },
    ): void {
        this.resetSession();
        this.activeCuid = cuid;
        const saved = this.sessionStorage.activate(cuid);
        if (saved) {
            this.selectedFields = { ...saved.selectedFields };
            this.nameSuggestion = this.normalizeSuggestedName(
                saved.nameSuggestion,
            );
            this.appliedName =
                saved.appliedName &&
                this.nameSuggestion !== null &&
                this.nameSuggestion === learningObject.name;
            this.appliedNameValue = this.appliedName
                ? this.nameSuggestion
                : null;
            this.descriptionOptions = [...saved.descriptionOptions];
            this.descriptionIndex = Math.min(
                Math.max(0, saved.descriptionIndex),
                Math.max(0, this.descriptionOptions.length - 1),
            );
            const savedAppliedDescriptionIndex = saved.appliedDescriptionIndex;
            this.appliedDescriptionIndex =
                savedAppliedDescriptionIndex !== null &&
                savedAppliedDescriptionIndex >= 0 &&
                savedAppliedDescriptionIndex < this.descriptionOptions.length &&
                this.descriptionOptions[savedAppliedDescriptionIndex] ===
                    learningObject.description
                    ? savedAppliedDescriptionIndex
                    : null;
            this.appliedDescriptionValue =
                this.appliedDescriptionIndex === null
                    ? null
                    : this.descriptionOptions[this.appliedDescriptionIndex];
            this.outcomeSuggestions = [...saved.outcomeSuggestions];
            this.hasGeneratedOutcomes =
                saved.hasGeneratedOutcomes ||
                this.outcomeSuggestions.length > 0;
            this.hasGeneratedSuggestions =
                saved.hasGeneratedSuggestions ||
                this.nameSuggestion !== null ||
                this.descriptionOptions.length > 0 ||
                this.hasGeneratedOutcomes;
            this.reviewing = this.hasGeneratedSuggestions;
        }
        this.persistSession();
    }

    /** Resets all transient suggestion, loading, and review state before restoring another object. */
    private resetSession(): void {
        this.reviewing = false;
        this.hasGeneratedSuggestions = false;
        this.hasGeneratedOutcomes = false;
        this.selectedFields = {
            name: true,
            description: true,
            learningOutcomes: true,
        };
        this.nameSuggestion = null;
        this.appliedName = false;
        this.appliedNameValue = null;
        this.descriptionOptions = [];
        this.descriptionIndex = 0;
        this.appliedDescriptionIndex = null;
        this.appliedDescriptionValue = null;
        this.outcomeSuggestions = [];
        this.errorMessage = null;
        for (const field of Object.keys(
            this.loading,
        ) as AgenticBuilderField[]) {
            this.loading[field] = false;
            this.sectionErrors[field] = null;
        }
    }

    /** Saves the current review state for the active learning object in session storage. */
    private persistSession(): void {
        if (!this.activeCuid) return;
        const state: AgenticBuilderSessionState = {
            selectedFields: { ...this.selectedFields },
            reviewing: this.reviewing,
            hasGeneratedSuggestions: this.hasGeneratedSuggestions,
            hasGeneratedOutcomes: this.hasGeneratedOutcomes,
            nameSuggestion: this.nameSuggestion,
            appliedName: this.appliedName,
            descriptionOptions: [...this.descriptionOptions],
            descriptionIndex: this.descriptionIndex,
            appliedDescriptionIndex: this.appliedDescriptionIndex,
            outcomeSuggestions: [...this.outcomeSuggestions],
        };
        this.sessionStorage.save(this.activeCuid, state);
    }

    /** Normalizes AI titles to exclude characters forbidden in learning object names. */
    private normalizeSuggestedName(value: unknown): string | null {
        const name = this.validString(value);
        if (!name) return null;
        return this.validString(
            name
                .replace(/[\\/]/g, "-")
                .replace(/[*"]/g, "")
                .replace(/\s+/g, " "),
        );
    }

    /** Trims a non-empty string value, returning null for other or blank values. */
    private validString(value: unknown): string | null {
        if (typeof value !== "string") return null;
        const normalized = value.trim();
        return normalized ? normalized : null;
    }

    /** Checks that a generated outcome has non-empty Bloom, verb, and text values. */
    private isValidOutcome(
        outcome: AgenticOutcomeSuggestion,
    ): outcome is AgenticOutcomeSuggestion {
        return Boolean(
            outcome &&
            this.validString(outcome.bloom) &&
            this.validString(outcome.verb) &&
            this.validString(outcome.text),
        );
    }

    /** Extracts a useful server or client error message, with a user-facing fallback. */
    private getErrorMessage(error: unknown): string {
        const fallback =
            "We could not generate this learning object. Please try again.";
        const response =
            error instanceof HttpErrorResponse ? error.error : error;

        return this.findMessage(response) ?? fallback;
    }

    /** Finds message text in common nested API error shapes or encoded JSON strings. */
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
