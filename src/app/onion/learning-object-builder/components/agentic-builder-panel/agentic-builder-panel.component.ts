import { NgIf } from "@angular/common";
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
        } catch (_error) {
            this.toasterService.error(
                "Generation failed",
                "We could not start Agentic Builder generation. Please try again.",
            );
        } finally {
            this.generating = false;
            this.store.clearAgenticGeneration();
        }
    }
}
