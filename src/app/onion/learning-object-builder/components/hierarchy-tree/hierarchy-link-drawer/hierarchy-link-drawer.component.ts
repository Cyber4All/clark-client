import { NgClass, NgFor, NgIf, TitleCasePipe } from "@angular/common";
import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import { Subject, Subscription } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { LearningObject, Topic } from "@entity";
import { HierarchyService } from "../../../../../core/learning-object-module/hierarchy/hierarchy.service";
import { TopicsService } from "../../../../../core/learning-object-module/topics/topics.service";
import { LENGTH_ORDER, isValidChildLength } from "../hierarchy-length.util";

/** Results per request. */
export const LINK_PAGE_SIZE = 10;

/** The API needs at least this many characters to search by text. */
export const MIN_SEARCH_CHARACTERS = 3;

/** Where the drawer is in a search. */
export type LinkSearchState = "loading" | "ready" | "error";

/**
 * Side panel for linking a released learning object as a read-only child
 * (sc-40641). Rendered in a CDK Overlay owned by `HierarchyTreeComponent`,
 * like the other Hierarchy dialogs.
 *
 * It searches released objects from every author through
 * `HierarchyService.searchLinkCandidates` (the API already leaves out the
 * parent, its ancestors, everything already in the hierarchy, and lengths that
 * are invalid for the parent) with a text query and length and topic filters.
 * Choosing a result emits `link`; the tree saves it and reports back through
 * {@link markLinked} or {@link showLinkError}. The panel stays open after a
 * link so several objects can be linked in a row.
 *
 * Link-only for now: adding the author's own unreleased objects as editable
 * children (sc-40237) will extend this panel.
 */
@Component({
    selector: "clark-hierarchy-link-drawer",
    templateUrl: "./hierarchy-link-drawer.component.html",
    styleUrls: ["./hierarchy-link-drawer.component.scss"],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        TitleCasePipe,
        ReactiveFormsModule,
        A11yModule,
    ],
})
export class HierarchyLinkDrawerComponent implements OnInit, OnDestroy {
    /** Id of the learning object that would become the parent. */
    @Input() parentId = "";
    /** Name of that parent, for the heading. */
    @Input() parentName = "";
    /** Length of that parent; only shorter lengths are offered as filters. */
    @Input() parentLength: LearningObject.Length = LearningObject.Length.COURSE;
    /** Root of the hierarchy being edited, so the API can leave out its members. */
    @Input() hierarchyRootId = "";
    /** Signed-in username, used to mark the author's own released objects. */
    @Input() currentUsername = "";
    /** Fallback label when the parent has no name. */
    @Input() unnamedLabel = "Unnamed object";

    /** Emitted with the chosen released object. */
    @Output() link = new EventEmitter<LearningObject>();
    /** Emitted by the close button (the tree also closes on Escape and a backdrop click). */
    @Output() close = new EventEmitter<void>();

    readonly form = new FormGroup({
        text: new FormControl<string>("", { nonNullable: true }),
        topic: new FormControl<string>("", { nonNullable: true }),
        lengths: new FormControl<LearningObject.Length[]>([], {
            nonNullable: true,
        }),
    });

    /** Lengths that can be children of the parent, shortest to longest. */
    lengths: LearningObject.Length[] = [];
    topics: Topic[] = [];
    topicsFailed = false;

    state: LinkSearchState = "loading";
    candidates: LearningObject[] = [];
    /** Candidates across all pages, as reported by the API. */
    total = 0;
    /** True while a next page is loading. */
    loadingMore = false;
    /** Id of the result being saved; every Link button is locked meanwhile. */
    linkingId: string | null = null;
    /** Why the last link failed; cleared on the next attempt. */
    linkError = "";
    /** How many objects were linked from this panel since it opened. */
    linkedCount = 0;

    private readonly destroy$ = new Subject<void>();
    private searchSubscription?: Subscription;

    constructor(
        private hierarchyService: HierarchyService,
        private topicsService: TopicsService,
    ) {}

    ngOnInit(): void {
        this.lengths = LENGTH_ORDER.filter((length) =>
            isValidChildLength(this.parentLength, length),
        );
        void this.topicsService.getTopics().then(
            (topics) => (this.topics = topics ?? []),
            () => (this.topicsFailed = true),
        );
        this.form.valueChanges
            .pipe(debounceTime(300), takeUntil(this.destroy$))
            .subscribe(() => this.search());
        this.search();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.searchSubscription?.unsubscribe();
    }

    get displayParentName(): string {
        return this.parentName?.trim() || this.unnamedLabel;
    }

    /** True when the text is too short for the API; no search runs until it is longer. */
    get textTooShort(): boolean {
        const text = this.form.controls.text.value.trim();

        return text.length > 0 && text.length < MIN_SEARCH_CHARACTERS;
    }

    get hasMore(): boolean {
        return this.candidates.length < this.total;
    }

    get filtersActive(): boolean {
        const { text, topic, lengths } = this.form.getRawValue();

        return !!text.trim() || !!topic || lengths.length > 0;
    }

    /** Short status line for the results, also read out by screen readers. */
    get summary(): string {
        if (this.state === "loading") {
            return "Searching released objects…";
        }
        if (this.state === "error") {
            return "";
        }
        if (this.textTooShort) {
            return `Type at least ${MIN_SEARCH_CHARACTERS} characters to search by name.`;
        }
        if (!this.total) {
            return "";
        }

        return this.total === 1
            ? "1 released object can be linked here"
            : `${this.total} released objects can be linked here`;
    }

    isLengthSelected(length: LearningObject.Length): boolean {
        return this.form.controls.lengths.value.includes(length);
    }

    onLengthToggle(length: LearningObject.Length, checked: boolean): void {
        const current = this.form.controls.lengths.value;
        this.form.controls.lengths.setValue(
            checked
                ? [...current, length]
                : current.filter((value) => value !== length),
        );
    }

    onClearFilters(): void {
        this.form.reset({ text: "", topic: "", lengths: [] });
    }

    /** Run the search again (the error state's Retry button). */
    onRetry(): void {
        this.search();
    }

    onLoadMore(): void {
        this.search(true);
    }

    /** Whether the result belongs to the signed-in author. */
    isOwn(candidate: LearningObject): boolean {
        return (
            !!this.currentUsername &&
            candidate.author?.username === this.currentUsername
        );
    }

    /**
     * The description as plain text. Descriptions are stored as HTML (`<p>`,
     * `&nbsp;`), which must not show up as markup in a two-line preview.
     * DOMParser builds an inert document, so nothing in it runs or loads.
     */
    plainDescription(candidate: LearningObject): string {
        const html = candidate.description ?? "";
        if (!html) {
            return "";
        }
        const text =
            new DOMParser().parseFromString(html, "text/html").body
                .textContent ?? "";

        return text.replace(/\s+/g, " ").trim();
    }

    authorLabel(candidate: LearningObject): string {
        return (
            candidate.author?.name?.trim() || candidate.author?.username || ""
        );
    }

    onLink(candidate: LearningObject): void {
        if (this.linkingId) {
            return;
        }
        this.linkError = "";
        this.linkingId = candidate.id;
        this.link.emit(candidate);
    }

    /** The tree saved the link: drop the result and count it. */
    markLinked(candidateId: string): void {
        this.linkingId = null;
        this.linkedCount++;
        if (this.candidates.some((candidate) => candidate.id === candidateId)) {
            this.candidates = this.candidates.filter(
                (candidate) => candidate.id !== candidateId,
            );
            this.total = Math.max(0, this.total - 1);
        }
    }

    /** The tree could not link it: unlock the buttons and say why. */
    showLinkError(message: string): void {
        this.linkingId = null;
        this.linkError = message;
    }

    onClose(): void {
        this.close.emit();
    }

    trackById(_index: number, candidate: LearningObject): string {
        return candidate.id;
    }

    /**
     * Fetch results for the current form. A new search replaces the list and
     * cancels the one in flight; `more` appends the next page instead.
     *
     * The next page is worked out from how many results are showing, not from
     * a page counter: a result that was linked is gone from the server's list,
     * which shifts every later page up by one. Asking for the page that holds
     * the next unseen result and skipping ids already shown keeps the list
     * free of gaps and duplicates.
     */
    private search(more = false): void {
        if (this.textTooShort) {
            return;
        }
        this.searchSubscription?.unsubscribe();
        const { text, topic, lengths } = this.form.getRawValue();
        const page = more
            ? Math.floor(this.candidates.length / LINK_PAGE_SIZE) + 1
            : 1;
        if (more) {
            this.loadingMore = true;
        } else {
            this.state = "loading";
            this.loadingMore = false;
        }

        this.searchSubscription = this.hierarchyService
            .searchLinkCandidates({
                parentId: this.parentId,
                hierarchyRootId: this.hierarchyRootId || undefined,
                text: text.trim() || undefined,
                topics: topic ? [topic] : undefined,
                // With no filter chosen, still limit to what the parent can hold.
                length: lengths.length ? lengths : this.lengths,
                currPage: page,
                limit: LINK_PAGE_SIZE,
            })
            .subscribe({
                next: (result) => {
                    const shown = new Set(
                        this.candidates.map((candidate) => candidate.id),
                    );
                    this.candidates = more
                        ? [
                              ...this.candidates,
                              ...result.learningObjects.filter(
                                  (candidate) => !shown.has(candidate.id),
                              ),
                          ]
                        : result.learningObjects;
                    this.total = result.total;
                    this.state = "ready";
                    this.loadingMore = false;
                },
                error: () => {
                    this.loadingMore = false;
                    if (!more) {
                        this.state = "error";
                    } else {
                        this.linkError =
                            "More results could not be loaded. Try again.";
                    }
                },
            });
    }
}
