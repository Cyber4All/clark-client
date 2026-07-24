import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    Renderer2,
    ChangeDetectorRef,
    HostListener,
} from "@angular/core";
import {
    CdkDragDrop,
    moveItemInArray,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
} from "@angular/cdk/drag-drop";
import { BuilderStore } from "../../builder-store.service";
import { LearningObject } from "@entity";
import { UriRetrieverService } from "app/core/learning-object-module/uri-retriever.service";
import { catchError } from "rxjs/operators";
import {
    NgIf,
    NgFor,
    NgClass,
    TitleCasePipe,
    DatePipe,
} from "@angular/common";
import { SkipLinkComponent } from "../../../../shared/components/skip-link/skip-link.component";
import { TipDirective } from "../../../../shared/directives/tip.directive";
import { ActivateDirective } from "../../../../shared/directives/activate.directive";
import { PopupComponent } from "../../../../shared/modules/popups/popup.component";
import { TeleporterComponent } from "../../../../shared/modules/teleporter/teleporter.component";
import {
    AddChildComponent,
    CreatedChildHierarchy,
} from "./add-child/add-child.component";

@Component({
    selector: "clark-scaffold",
    templateUrl: "./scaffold.component.html",
    styleUrls: ["./scaffold.component.scss"],
    standalone: true,
    imports: [
        NgIf,
        SkipLinkComponent,
        CdkDropList,
        NgFor,
        CdkDrag,
        TipDirective,
        NgClass,
        CdkDragHandle,
        ActivateDirective,
        PopupComponent,
        TeleporterComponent,
        AddChildComponent,
        TitleCasePipe,
        DatePipe,
    ],
})
export class ScaffoldComponent implements OnInit {
    @Input() learningObject: LearningObject;

    // array to obtain children IDs
    childrenIDs: string[] = [];
    childrenConfirmationMessage: string;

    loadingChildrenError: boolean;

    children: LearningObject[];

    deleteIndex: number;

    // flags
    loading: boolean;
    childrenConfirmation: boolean;
    isAddingChild: boolean;
    childFlowLocked: boolean;

    @ViewChild("addChildButton") addChildButton: ElementRef;
    @ViewChild("teleporterPayload") teleporterPayload: ElementRef;

    @HostListener("window:click", ["$event"]) handleClickAway(
        event: MouseEvent,
    ) {
        this.toggleAddChild(false);
    }

    @HostListener("keyup", ["$event"]) handleEscape(event: KeyboardEvent) {
        if (event.code === "Escape") {
            this.toggleAddChild(false);
        }
    }
    constructor(
        private store: BuilderStore,
        private renderer: Renderer2,
        private cd: ChangeDetectorRef,
        private uriRetriver: UriRetrieverService,
    ) {}

    ngOnInit() {
        this.childrenConfirmation = false;

        if (!this.learningObject.id) {
            this.children = [];
            return;
        }

        // if the Learning Object can have children, attempt to load them
        if (this.learningObject.length !== LearningObject.Length.NANOMODULE) {
            this.loading = true;
            this.store
                .getChildren()
                .then((kiddos) => {
                    this.children = kiddos;
                    this.children.forEach((kid) =>
                        this.childrenIDs.push(kid.id),
                    );
                    this.loading = false;
                })
                .catch((error) => {
                    this.loading = false;
                    this.loadingChildrenError = true;
                });
        } else {
            this.children = [];
        }
    }

    get addChildDisabledReason(): string | undefined {
        if (
            this.learningObject.length === LearningObject.Length.NANOMODULE
        ) {
            return "Nanomodules cannot have children.";
        }

        if (!this.learningObject.id) {
            return "Name this learning object before adding children.";
        }

        return undefined;
    }

    /**
     * Add child to children array
     */
    addToChild(child: LearningObject) {
        if (this.children) {
            // if we already have a children array defined

            // add child to the children array
            this.children.unshift(child);

            // add child to the childrenIDs array
            this.childrenIDs.unshift(child.id);
        } else {
            // if we DO NOT already have a children array defined

            // add child to the children array
            this.children = [child];

            // add child to the childrenIDs array
            this.childrenIDs = [child.id];
        }

        // send request to the service to set children
        this.store.setChildren(this.childrenIDs);
    }

    handleCreatedChild(result: CreatedChildHierarchy): void {
        this.children = result.children;
        this.childrenIDs = result.children.map((child) => child.id);
        this.childFlowLocked = false;
        this.toggleAddChild(false);
    }

    /**
     * Function to allow for drag drop implementation for reordering of children
     *
     * @param CdkDragDrop<string[]>
     */
    drop(event: CdkDragDrop<string[]>) {
        // change the index of the child that has been moved in the array used for display
        moveItemInArray(this.children, event.previousIndex, event.currentIndex);

        this.childrenIDs = [];
        // get the ids of the children in children array
        this.children.forEach((kid) => this.childrenIDs.push(kid.id));

        // set the ids of children to the same order as the childrenIDs
        this.store.setChildren(this.childrenIDs);
    }

    /**
     * Triggers the delete confirmation modal for the child selected for deletion
     *
     * @param index of the LO selected for deletion
     */
    deleteButton(index) {
        this.deleteIndex = index;
        this.childrenConfirmationMessage = `Remove '${
            this.children[index].name
        }' as a child of '${
            this.learningObject.name
        }'?`;

        this.toggleConfirmationModal(true);
    }

    /**
     * Sends request to update the children array of the Learning Object
     */
    async deleteChild() {
        this.toggleConfirmationModal(false);
        // remove the child that was selected to be deleted
        this.children.splice(this.deleteIndex, 1);

        // set childrenIDs equal to the children array
        this.childrenIDs = [];
        this.children.forEach((kid) => this.childrenIDs.push(kid.id));
        await this.store.fetch(
            this.learningObject.cuid,
            this.learningObject.version,
        );
        await this.store.setChildren(this.childrenIDs, true);

        // get the children again to get current childrens array
        await this.store.getChildren();
    }
    /**
     * Toggles the confirmation modal based on the boolean val
     *
     * @param val
     */
    toggleConfirmationModal(val?: boolean) {
        this.childrenConfirmation = val;
    }
    /**
     * Toggles the child modal
     */
    toggleAddChild(value: boolean = true) {
        if (value && this.addChildDisabledReason) {
            return;
        }

        if (!value && this.childFlowLocked) {
            return;
        }

        if (value) {
            // [left, top]
            const position = [
                (
                    this.addChildButton.nativeElement as HTMLElement
                ).getBoundingClientRect().left,
                (
                    this.addChildButton.nativeElement as HTMLElement
                ).getBoundingClientRect().top,
            ];

            position[0] +=
                (this.addChildButton.nativeElement as HTMLElement).offsetLeft +
                100;

            position[1] +=
                (this.addChildButton.nativeElement as HTMLElement)
                    .offsetHeight - 43;

            // add the payload to the DOM
            this.isAddingChild = value;

            // detect changes to populate the ViewChild with the correct element
            this.cd.detectChanges();

            // set the correct coordinates for the payload to render
            this.renderer.setStyle(
                this.teleporterPayload.nativeElement,
                "left",
                position[0] + "px",
            );
            this.renderer.setStyle(
                this.teleporterPayload.nativeElement,
                "top",
                position[1] + "px",
            );
            this.renderer.setStyle(
                this.teleporterPayload.nativeElement,
                "width",
                (this.addChildButton.nativeElement as HTMLElement).offsetWidth +
                    50 +
                    "px",
            );

            this.renderer.addClass(
                this.teleporterPayload.nativeElement,
                "add-child--active",
            );
        } else {
            // remove the payload from the DOM
            this.isAddingChild = value;
            this.childFlowLocked = false;
        }
    }
}
