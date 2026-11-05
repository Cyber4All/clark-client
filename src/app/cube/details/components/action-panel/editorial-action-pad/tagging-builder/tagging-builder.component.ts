import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from "@angular/core";
import { LearningObject, LearningOutcome, Tag } from "@entity";
import { TagType } from "entity/tag/tag";
import { TaggingService } from "../services/tagging.service";
import { TopicsService } from "app/core/learning-object-module/topics/topics.service";
import { TagsService } from "app/core/learning-object-module/tags/tags.service";
import { AlignmentService } from "../services/alignment.service";
import { BundlingService } from "../../../../../../core/learning-object-module/bundling/bundling.service";
import { NgStyle, NgIf, NgFor } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TopicsComponent } from "../components/topics/topics.component";
import { TagsComponent } from "../components/tags/tags.component";
import { GuidelinesComponent } from "../components/guidelines/guidelines.component";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";

interface CreateTagRequest {
    type: TagType;
    name: string;
    description?: string;
}

@Component({
    selector: "clark-tagging-builder",
    templateUrl: "./tagging-builder.component.html",
    styleUrls: ["./tagging-builder.component.scss"],
    standalone: true,
    imports: [
        NgStyle,
        NgIf,
        NgFor,
        FormsModule,
        TopicsComponent,
        TagsComponent,
        GuidelinesComponent,
    ],
})
export class TaggingBuilderComponent implements OnInit, AfterViewInit {
    @Input() learningObject: LearningObject;
    oldOutcomes: LearningOutcome[];
    @Output() close: EventEmitter<void> = new EventEmitter();
    @Output() saved: EventEmitter<void> = new EventEmitter();

    currentTab: "topics" | "tags" | "alignment" = "topics";
    underlineLeft = "0px";
    underlineWidth = "300px";

    loading = false;
    showCreateTagModal = false;
    tagTypes: { name: string; value: TagType }[] = [];
    newTag: { name: string; type: TagType | ""; description: string } = {
        name: "",
        type: "",
        description: "",
    };
    private pendingTags = new Map<string, CreateTagRequest>();

    constructor(
        private elRef: ElementRef,
        private cdr: ChangeDetectorRef,
        private taggingService: TaggingService,
        private topicService: TopicsService,
        private tagsService: TagsService,
        private alignmentService: AlignmentService,
        private bundlingService: BundlingService,
        private toaster: ToastrOvenService,
    ) {}

    async ngOnInit() {
        this.loading = true;
        const topics = await this.topicService.getTopics();
        this.taggingService.setSourceArray("topics", topics);
        // Set the outcomes for the guidelines
        this.alignmentService.setOutcomes(this.learningObject.outcomes);
        // Type these
        this.oldOutcomes = this.learningObject.outcomes.map((outcome) => {
            return new LearningOutcome(outcome);
        });

        // Set selectedTopics if there is already some topics set
        if (this.learningObject.topics && this.learningObject.topics.length) {
            const matchingTopics = topics.filter((topic) => {
                return this.learningObject.topics.includes(topic._id);
            });

            this.taggingService.setSelectedArray("topics", matchingTopics);
        }

        const [tags, tagTypes] = await Promise.all([
            this.tagsService.getTags(),
            this.tagsService.getTypes(),
        ]);
        this.taggingService.setSourceArray("tags", tags);
        this.tagTypes = tagTypes;

        if (this.learningObject.tags && this.learningObject.tags.length) {
            const matchingTags = tags.filter((tag) => {
                return this.learningObject.tags.includes(tag._id);
            });
            this.taggingService.setSelectedArray("tags", matchingTags);
        }
        this.loading = false;
        this.switchTab("topics");
    }

    ngAfterViewInit() {
        // Delay the underline calculation until the DOM is fully rendered
        this.cdr.detectChanges();
        this.updateUnderline();
    }

    /**
     * Switches the tab and only has two valid options 'topics' or 'tags'
     * Note: This can be expanded if we need in the future
     * @param tab
     */
    switchTab(tab: "topics" | "tags" | "alignment") {
        this.currentTab = tab;
        this.updateUnderline();
    }

    /**
     * This updates the underline for the focused tab so there
     * is a visual indicator as to which page the user is on
     */
    updateUnderline() {
        // Select all tabs
        const tabs = this.elRef.nativeElement.querySelectorAll(".tab");

        const tabsArray: HTMLElement[] = Array.from(tabs) as HTMLElement[];

        const activeTab = tabsArray.find(
            (tab) =>
                tab.textContent?.trim().toLowerCase() ===
                this.currentTab.toLowerCase(),
        );

        if (activeTab?.parentElement) {
            const tabRect = activeTab.getBoundingClientRect();
            const parentRect = activeTab.parentElement.getBoundingClientRect();

            // Calculate the underline position and width based on the active tab
            this.underlineLeft = `${tabRect.left - parentRect.left}px`;
            this.underlineWidth = `${tabRect.width}px`;

            this.cdr.detectChanges();
        }
    }

    async save() {
        try {
            await this.persistPendingTags();
        } catch (_) {
            this.toaster.error(
                "Tag creation failed",
                "The new tag could not be saved. Please try again.",
            );
            return;
        }

        // Clean the selected arrays into string arrays for the PUT request
        const tagIds = this.taggingService.finalTags.map((tag) => {
            return tag._id;
        });
        const topicIds = this.taggingService.finalTopics.map((topic) => {
            return topic._id;
        });

        // Only send a request if there are selected options to avoid a 400 from the service
        if (topicIds.length > 0) {
            await this.topicService.updateObjectTopics(
                this.learningObject.id,
                topicIds,
            );
        }

        if (tagIds.length > 0) {
            await this.tagsService.updateObjectTags(
                this.learningObject.cuid,
                tagIds,
            );
        }

        // Save the outcomes which updates the README and then rebundle that dude
        await this.alignmentService.saveOutcomeMappings(
            this.oldOutcomes,
            this.learningObject.id,
        );
        await this.bundlingService.bundleLearningObject(this.learningObject.id);

        this.saved.emit();
    }

    cancel() {
        this.close.emit();
    }

    stageTag(): void {
        const name = this.newTag.name.trim();
        if (!name || !this.newTag.type) return;

        const request: CreateTagRequest = {
            name,
            type: this.newTag.type as TagType,
            description: this.newTag.description.trim() || undefined,
        };
        const temporaryId = `pending-tag-${Date.now()}-${this.pendingTags.size}`;
        const pendingTag: Tag = {
            _id: temporaryId,
            type: [request.type],
            name: request.name,
            description: request.description,
        };

        // Keep the tag local until the outer Save button confirms the tagging changes.
        this.pendingTags.set(temporaryId, request);
        this.taggingService.setSourceArray("tags", [
            ...this.taggingService.availableTags,
            pendingTag,
        ]);
        this.closeCreateTagModal();
        this.toaster.success(
            "Tag added",
            `${pendingTag.name} will be created when you save.`,
        );
    }

    private async persistPendingTags(): Promise<void> {
        if (this.pendingTags.size === 0) return;

        const pendingEntries = Array.from(this.pendingTags.entries());
        const createdTags = await Promise.all(
            pendingEntries.map(([, request]) =>
                this.tagsService.createTag(request).toPromise(),
            ),
        );
        const createdByTemporaryId = new Map(
            pendingEntries.map(([temporaryId], index) => [
                temporaryId,
                createdTags[index],
            ]),
        );

        // Replace temporary tags before saving selected IDs to the learning object.
        this.taggingService.setSourceArray(
            "tags",
            this.taggingService.availableTags.map(
                (tag) => createdByTemporaryId.get(tag._id) ?? tag,
            ),
        );
        this.taggingService.setSelectedArray(
            "tags",
            this.taggingService.finalTags.map(
                (tag) => createdByTemporaryId.get(tag._id) ?? tag,
            ),
        );
        this.pendingTags.clear();
    }

    closeCreateTagModal(): void {
        this.showCreateTagModal = false;
        this.newTag = { name: "", type: "", description: "" };
        // This component is projected through the tagging popup's dynamically attached view.
        // Refresh it directly so asynchronous request callbacks remove the dialog immediately.
        this.cdr.detectChanges();
    }
}
