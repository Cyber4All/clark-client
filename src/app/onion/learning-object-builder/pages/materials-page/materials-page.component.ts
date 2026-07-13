import { NgFor, NgIf } from "@angular/common";
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
import { MaterialNotesComponent } from "../../components/material-notes/material-notes.component";
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
        NgFor,
        MaterialNotesComponent,
    ],
})
export class MaterialsPageComponent implements OnInit, OnDestroy {
    saving$: Subject<boolean> = new Subject<boolean>();
    error$: Subject<string> = new Subject<string>();
    learningObject$: Observable<LearningObject>;
    destroyed$: Subject<void> = new Subject();
    learningObject: LearningObject;
    notes = [
        {
            title: "Videos",
            content: `<p>Uploaded videos are transferred to CLARK's YouTube channel. If you host videos yourself, add them as URLs. We will contact you if video content needs updates.</p>`,
        },
        {
            title: "Solution Files",
            content: `<p>You may upload solution files. If solutions are included elsewhere in the learning object, note where reviewers can find them.</p>`,
        },
        {
            title: "Malware",
            content: `<p>Reviewers will label malware files and add a user-facing note. Upload malware samples in password-protected ZIP files and include the password in notes.</p>`,
        },
        {
            title: "Large Files (1GB+)",
            content: `<p>For files 1GB or larger, including VMs, logs, or applications, contact <a href="mailto:editors@secured.team">editors@secured.team</a> before submitting.</p>`,
        },
        {
            title: "Third-Party Software",
            content: `<p>If the object requires third-party software, include links to relevant FAQ or troubleshooting resources.</p>`,
        },
        {
            title: "Semester Info",
            content: `<p>Remove semester-specific details, such as due dates, before submitting. By submitting, you consent to CLARK removing semester details found during review. Contact info@secured.team if you do not want this removed.</p>`,
        },
    ];

    constructor(private store: BuilderStore) { }

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

    // Toggle function for exiting builder
    handleUploadComplete(val: string) {
        this.store.toggleUploadComplete(val);
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.unsubscribe();
    }
}
