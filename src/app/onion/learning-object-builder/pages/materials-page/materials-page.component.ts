import { NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { LearningObject } from "@entity";
import { DirectoryNode } from "app/shared/modules/filesystem/DirectoryNode";
import { Observable, Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { SkipLinkComponent } from "../../../../shared/components/skip-link/skip-link.component";
import { BUILDER_ACTIONS, BuilderStore } from "../../builder-store.service";
import { ColumnWrapperComponent } from "../../components/column-wrapper/column-wrapper.component";
import { FileUploadMeta } from "../../components/content-upload/app/services/typings";
import { UploadComponent } from "../../components/content-upload/app/upload/upload.component";
import { ScaffoldComponent } from "../../components/scaffold/scaffold.component";

@Component({
    selector: "clark-materials-page",
    templateUrl: "./materials-page.component.html",
    styleUrls: ["./materials-page.component.scss"],
    standalone: true,
    imports: [
        ColumnWrapperComponent,
        NgIf,
        ScaffoldComponent,
        UploadComponent,
        SkipLinkComponent,
    ],
})
export class MaterialsPageComponent implements OnInit, OnDestroy {
    saving$: Subject<boolean> = new Subject<boolean>();
    error$: Subject<string> = new Subject<string>();
    learningObject$: Observable<LearningObject>;
    destroyed$: Subject<void> = new Subject();
    learningObject: LearningObject;
    constructor(private store: BuilderStore) {}

    ngOnInit() {
        // Sets the learning object observable to continuously update the
        // learning object in the store until the component is destroyed
        this.learningObject$ = this.store.learningObjectEvent.pipe(
            takeUntil(this.destroyed$),
        );

        this.saving$.pipe(takeUntil(this.destroyed$)).subscribe((val) => {
            this.store.serviceInteraction$.next(val);
        });

        // listen for outcome events and update component stores
        this.store.learningObjectEvent
            .pipe(
                filter((learningObject) => learningObject !== undefined),
                takeUntil(this.destroyed$),
            )
            .subscribe((payload: LearningObject) => {
                this.learningObject = payload;
            });
    }

    async handleFileDeletion(fileIds: string[]) {
        // Refresh object or materials
        try {
            await this.store.execute(BUILDER_ACTIONS.DELETE_FILES, { fileIds });
        } catch (e) {
            this.error$.next(e);
        }
    }

    async handleFilesUploaded(files: FileUploadMeta[]) {
        // Refresh object or materials
        try {
            await this.store.execute(BUILDER_ACTIONS.ADD_FILE_META, { files });
        } catch (e) {
            this.error$.next(e);
        }
    }

    async handleUrlAdded() {
        try {
            await this.store.execute(BUILDER_ACTIONS.ADD_URL);
        } catch (e) {
            this.error$.next(e);
        }
    }

    async handleUrlUpdated(data: {
        index: number;
        url: LearningObject.Material.Url;
    }) {
        try {
            await this.store.execute(BUILDER_ACTIONS.UPDATE_URL, data);
        } catch (e) {
            this.error$.next(e);
        }
    }

    async handleUrlRemoved(index: number) {
        try {
            await this.store.execute(BUILDER_ACTIONS.REMOVE_URL, index);
        } catch (e) {
            this.error$.next(e);
        }
    }

    async handleFileDescriptionUpdate(fileMeta: {
        id: string;
        description: string;
    }) {
        try {
            await this.store.execute(
                BUILDER_ACTIONS.UPDATE_FILE_DESCRIPTION,
                fileMeta,
            );
        } catch (e) {
            this.error$.next(e);
        }
    }

    async handleFolderDescriptionUpdate(folderMeta: {
        path: string;
        description: string;
    }) {
        try {
            await this.store.execute(
                BUILDER_ACTIONS.UPDATE_FOLDER_DESCRIPTION,
                folderMeta,
            );
        } catch (e) {
            this.error$.next(e);
        }
    }

    async handleNotesUpdate(notes: string) {
        try {
            await this.store.execute(
                BUILDER_ACTIONS.UPDATE_MATERIAL_NOTES,
                notes,
            );
        } catch (e) {
            this.error$.next(e);
        }
    }

    /**
     * Executes builder service action to save the file/folder's new packageable property
     *
     * @param event - state: the new packageable property
     *              - item: the file/folder to save
     */
    async handlePackageableToggled(event: {
        state: boolean;
        item: DirectoryNode | LearningObject.Material.File;
    }) {
        try {
            await this.store.execute(BUILDER_ACTIONS.TOGGLE_BUNDLE, event);
        } catch (e) {
            this.error$.next(e);
        }
    }

    async handleContextToggled(event: {
        state: boolean;
        item: DirectoryNode | LearningObject.Material.File;
    }) {
        try {
            await this.store.execute(BUILDER_ACTIONS.TOGGLE_CONTEXT, event);
        } catch (e) {
            this.error$.next(e);
        }
    }

    // Toggle function for exiting builder
    handleUploadComplete(val: string) {
        this.store.toggleUploadComplete(val);
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.unsubscribe();
    }
}
