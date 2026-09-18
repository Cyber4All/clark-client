import { NgIf } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Output } from "@angular/core";
import { LearningObjectService } from "app/core/learning-object-module/learning-object/learning-object.service";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";
import { ActivateDirective } from "../../../../shared/directives/activate.directive";
import { AgenticBuilderField, BuilderStore } from "../../builder-store.service";

@Component({
    selector: "onion-agentic-builder-panel",
    templateUrl: "./agentic-builder-panel.component.html",
    styleUrls: ["./agentic-builder-panel.component.scss"],
    standalone: true,
    imports: [NgIf, ActivateDirective],
})
export class AgenticBuilderPanelComponent {
    @Output() closed = new EventEmitter<void>();

    generating = false;
    errorMessage: string | null = null;
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

    setField(field: keyof typeof this.selectedFields, event: Event): void {
        this.selectedFields[field] = (event.target as HTMLInputElement).checked;
    }

    close(): void {
        if (!this.generating) {
            this.closed.emit();
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
            await this.learningObjectService.buildLearningObject(
                learningObjectId,
                { fields },
            );
            await this.store.fetch(learningObject.cuid, learningObject.version);
            this.toasterService.success(
                "Generation complete",
                "Your learning object has been updated.",
            );
            this.closed.emit();
        } catch (error) {
            this.errorMessage = this.getErrorMessage(error);
            this.toasterService.error("Generation failed", this.errorMessage);
        } finally {
            this.generating = false;
            this.store.clearAgenticGeneration();
        }
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
