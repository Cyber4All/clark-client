import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
} from "@angular/core";
import { LearningObject } from "@entity";
import { AuthService } from "app/core/auth-module/auth.service";
import { takeUntil, debounceTime } from "rxjs/operators";
import { BehaviorSubject, Subject } from "rxjs";
import { SearchService } from "app/core/learning-object-module/search/search.service";
import { FormsModule } from "@angular/forms";
import { AutofocusDirective } from "../../../../../shared/directives/autofocus.directive";
import { ActivateDirective } from "../../../../../shared/directives/activate.directive";
import {
    NgIf,
    NgFor,
    NgClass,
    NgTemplateOutlet,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TitleCasePipe,
    DatePipe,
} from "@angular/common";
import { VirtualScrollerModule } from "@iharbeck/ngx-virtual-scroller";
import { SkipLinkComponent } from "../../../../../shared/components/skip-link/skip-link.component";
import { BuilderStore } from "../../../builder-store.service";

type AddChildMode = "create" | "existing";
type ChildCreationStage =
    | "idle"
    | "validating"
    | "creating"
    | "attaching"
    | "attachFailed"
    | "refreshing"
    | "refreshFailed";

export interface CreatedChildHierarchy {
    child: LearningObject;
    children: LearningObject[];
}

@Component({
    selector: "clark-add-child",
    templateUrl: "./add-child.component.html",
    styleUrls: ["./add-child.component.scss"],
    standalone: true,
    imports: [
        FormsModule,
        AutofocusDirective,
        ActivateDirective,
        NgIf,
        VirtualScrollerModule,
        NgFor,
        NgClass,
        NgTemplateOutlet,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        SkipLinkComponent,
        TitleCasePipe,
        DatePipe,
    ],
})
export class AddChildComponent implements OnInit, OnDestroy {
    // the child that is currently being edited
    @Input() child: LearningObject;
    @Input() currentChildren: string[];
    // emits the child that is to be added to the children array
    @Output() childToAdd: EventEmitter<LearningObject> = new EventEmitter();
    @Output() childCreated: EventEmitter<CreatedChildHierarchy> =
        new EventEmitter();
    @Output() dismissalLockChange: EventEmitter<boolean> = new EventEmitter();

    children: LearningObject[];
    loading: boolean;

    mode: AddChildMode = "existing";
    newChildName: string;
    defaultChildLength: LearningObject.Length;
    creatingChild: boolean;
    creationStage: ChildCreationStage = "idle";
    createdChild: LearningObject;
    createChildError: string;
    private childWindow: Window | null;

    childrenSearchString: string;
    searchString$: BehaviorSubject<string> = new BehaviorSubject("");
    componentDestroyed$: Subject<void> = new Subject();

    readonly lengths = [
        LearningObject.Length.NANOMODULE,
        LearningObject.Length.MICROMODULE,
        LearningObject.Length.MODULE,
        LearningObject.Length.UNIT,
        LearningObject.Length.COURSE,
    ];

    constructor(
        private searchLearningObjectService: SearchService,
        private store: BuilderStore,
        public auth: AuthService,
    ) {
        this.searchString$
            .pipe(takeUntil(this.componentDestroyed$), debounceTime(650))
            .subscribe(() => {
                this.search();
            });
    }

    async ngOnInit() {
        this.newChildName = `${this.child.name} Child #${
            (this.currentChildren?.length ?? 0) + 1
        }`;
        const parentLengthIndex = this.lengths.indexOf(this.child.length);
        this.defaultChildLength = this.lengths[parentLengthIndex - 1];
        this.children = await this.getLearningObjects();
    }

    selectMode(mode: AddChildMode): void {
        this.mode = mode;
        this.createChildError = undefined;
    }

    async createNewChild(): Promise<void> {
        if (this.creatingChild || this.createdChild) {
            return;
        }

        const name = this.newChildName?.trim();
        if (!name) {
            this.createChildError = "Enter a name for the new child.";
            return;
        }

        this.creatingChild = true;
        this.creationStage = "validating";
        this.createChildError = undefined;
        this.dismissalLockChange.emit(true);
        this.childWindow = this.reserveChildWindow();

        try {
            const nameAvailable =
                await this.store.isLearningObjectNameAvailable(name);
            if (!nameAvailable) {
                this.createChildError =
                    "A learning object with this name already exists.";
                this.creationStage = "idle";
                this.dismissalLockChange.emit(false);
                this.closeReservedChildWindow();
                return;
            }
        } catch {
            this.createChildError =
                "Unable to validate this child name. Try again.";
            this.creationStage = "idle";
            this.dismissalLockChange.emit(false);
            this.closeReservedChildWindow();
            return;
        }

        try {
            this.creationStage = "creating";
            const child = new LearningObject({
                author: this.auth.user,
                name,
                length: this.defaultChildLength,
                status: LearningObject.Status.UNRELEASED,
            });
            this.createdChild = await this.store.createHierarchyChild(
                child.toPlainObject(),
            );
        } catch {
            this.createChildError =
                "The child could not be created. No child was attached. Try again.";
            this.creationStage = "idle";
            this.dismissalLockChange.emit(false);
            this.closeReservedChildWindow();
            return;
        } finally {
            this.creatingChild = false;
        }

        await this.attachCreatedChild();
    }

    async retryAttach(): Promise<void> {
        if (
            this.creatingChild ||
            !this.createdChild ||
            this.creationStage !== "attachFailed"
        ) {
            return;
        }

        this.childWindow = this.reserveChildWindow();
        await this.attachCreatedChild();
    }

    async retryRefresh(): Promise<void> {
        if (
            this.creatingChild ||
            !this.createdChild ||
            this.creationStage !== "refreshFailed"
        ) {
            return;
        }

        await this.refreshParentHierarchy();
    }

    openCreatedChild(): void {
        if (!this.createdChild) {
            return;
        }

        this.openChildBuilder(this.createdChild, null);
    }

    /**
     * Retrieve the list of candidate children and filter out the current children
     * as well as the object that is currently being edited
     *
     * @param filters
     */
    async getLearningObjects(
        filters?: any,
        query?: string,
    ): Promise<LearningObject[]> {
        this.loading = true;
        const draftObjects = await this.searchLearningObjectService
            .getUsersLearningObjects(this.child.author.username, {
                ...filters,
                text: query,
                draftsOnly: true,
            })
            .then(
                (response: {
                    learningObjects: LearningObject[];
                    total: number;
                }) => {
                    const indx = this.lengths.indexOf(this.child.length);
                    const childrenLengths = this.lengths.slice(0, indx);
                    return response.learningObjects.filter(
                        (child: LearningObject) => {
                            return (
                                !this.currentChildren.includes(child.id) &&
                                childrenLengths.includes(child.length)
                            );
                        },
                    );
                },
            );
        const releasedObjects = await this.searchLearningObjectService
            .getUsersLearningObjects(this.child.author.username, {
                ...filters,
                text: query,
            })
            .then(
                (response: {
                    learningObjects: LearningObject[];
                    total: number;
                }) => {
                    const indx = this.lengths.indexOf(this.child.length);
                    const childrenLengths = this.lengths.slice(0, indx);
                    return response.learningObjects.filter(
                        (child: LearningObject) => {
                            return (
                                !this.currentChildren.includes(child.id) &&
                                childrenLengths.includes(child.length)
                            );
                        },
                    );
                },
            );
        this.loading = false;
        return [...draftObjects, ...releasedObjects];
    }

    /**
     * Takes the index of the LO within the array and emits it to the parent
     * and also removes it from the array of candidate children for the LO
     *
     * @param index
     */
    addChildToList(child, index) {
        this.childToAdd.emit(child);
        this.children.splice(index, 1);
    }

    async search() {
        this.children = await this.getLearningObjects(
            null,
            this.childrenSearchString,
        );
    }

    private reserveChildWindow(): Window | null {
        const childWindow = window.open("", "_blank");
        if (childWindow) {
            childWindow.opener = null;
            childWindow.document.title = "Creating child learning object";
            childWindow.document.body.textContent =
                "Creating child learning object...";
        }
        return childWindow;
    }

    private async attachCreatedChild(): Promise<void> {
        this.creatingChild = true;
        this.creationStage = "attaching";
        this.createChildError = undefined;

        try {
            await this.store.attachHierarchyChild(this.createdChild.id);
        } catch {
            this.creationStage = "attachFailed";
            this.createChildError = `'${this.createdChild.name}' was created but could not be attached to '${this.child.name}'. Open the created child or retry attaching it.`;
            this.closeReservedChildWindow();
            this.creatingChild = false;
            return;
        }

        this.openChildBuilder(this.createdChild, this.childWindow);
        this.childWindow = null;
        this.creatingChild = false;
        await this.refreshParentHierarchy();
    }

    private async refreshParentHierarchy(): Promise<void> {
        this.creatingChild = true;
        this.creationStage = "refreshing";
        this.createChildError = undefined;

        try {
            const children = await this.store.getChildren();
            this.dismissalLockChange.emit(false);
            this.childCreated.emit({ child: this.createdChild, children });
        } catch {
            this.creationStage = "refreshFailed";
            this.createChildError = `'${this.createdChild.name}' was created and attached, but the parent hierarchy could not be refreshed. Retry refreshing the hierarchy.`;
        } finally {
            this.creatingChild = false;
        }
    }

    private closeReservedChildWindow(): void {
        this.childWindow?.close();
        this.childWindow = null;
    }

    private openChildBuilder(
        child: LearningObject,
        childWindow: Window | null,
    ): void {
        const path = `/onion/learning-object-builder/${encodeURIComponent(
            child.cuid,
        )}/${child.version}`;
        const url = new URL(path, window.location.origin).toString();

        if (childWindow) {
            childWindow.location.href = url;
        } else {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    }

    ngOnDestroy() {
        this.componentDestroyed$.next();
        this.componentDestroyed$.unsubscribe();
    }
}
