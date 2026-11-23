import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    EventEmitter,
    Output,
} from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

import { DirectoryTree } from "app/shared/modules/filesystem/DirectoryTree";
import { DirectoryNode } from "app/shared/modules/filesystem/DirectoryNode";

import { LearningObject } from "@entity";
import { takeUntil, take } from "rxjs/operators";
import { FileBrowserComponent } from "../../../../../../shared/modules/filesystem/file-browser/file-browser.component";
import { NgFor, NgIf } from "@angular/common";
import { ContextMenuComponent } from "../../../../../../shared/modules/contextmenu/context-menu/context-menu.component";
import { ActivateDirective } from "../../../../../../shared/directives/activate.directive";
import { PopupComponent } from "../../../../../../shared/modules/popups/popup.component";
import { ReactiveFormsModule, UntypedFormControl } from "@angular/forms";
import { FileService } from "app/core/learning-object-module/file/file.service";
import { ToastrOvenService } from "app/shared/modules/toaster/notification.service";

const INVALID_MATERIAL_NAME_CHARACTERS = /[&$@=;\/\\:+,?{^}%`"[\]~#|<>*]/;

export function validateMaterialName(
    name: string,
    originalName: string,
    isFile: boolean,
): string | null {
    const trimmedName = name.trim();
    if (!trimmedName) return "A name is required.";
    if (
        trimmedName === "." ||
        trimmedName === ".." ||
        INVALID_MATERIAL_NAME_CHARACTERS.test(trimmedName)
    ) {
        return "The name contains an invalid character.";
    }
    if (trimmedName === originalName) return "Enter a different name.";
    if (isFile && getExtension(trimmedName) !== getExtension(originalName)) {
        return "The file extension cannot be changed.";
    }
    return null;
}

function getExtension(name: string): string {
    const lastDot = name.lastIndexOf(".");
    return lastDot > 0 ? name.slice(lastDot).toLowerCase() : "";
}

export interface FileEdit {
    id?: string;
    path?: string;
    description: string;
    isFolder?: boolean;
}

@Component({
    selector: "onion-file-manager",
    templateUrl: "./file-manager.component.html",
    styleUrls: ["./file-manager.component.scss", "../../dropzone.scss"],
    standalone: true,
    imports: [
        FileBrowserComponent,
        NgIf,
        NgFor,
        ContextMenuComponent,
        ActivateDirective,
        PopupComponent,
        ReactiveFormsModule,
    ],
})
export class FileManagerComponent implements OnInit, OnDestroy {
    @Input() learningObjectId: string;
    @Input()
    files$: BehaviorSubject<LearningObject.Material.File[]> =
        new BehaviorSubject<LearningObject.Material.File[]>([]);
    @Input()
    folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    @Input()
    confirmDeletion: Subject<boolean> = new Subject<boolean>();
    @Input() deletionSuccessful$: EventEmitter<string[]> = new EventEmitter();
    @Output()
    fileDeleted: EventEmitter<string[]> = new EventEmitter<string[]>();
    @Output()
    fileEdited: EventEmitter<FileEdit> = new EventEmitter<FileEdit>();
    @Output()
    openFilePicker: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output()
    path: EventEmitter<string> = new EventEmitter<string>();
    @Output()
    packageableToggled: EventEmitter<{
        state: boolean;
        item: DirectoryNode | LearningObject.Material.File;
    }> = new EventEmitter();
    @Output()
    downloadClicked: EventEmitter<LearningObject.Material.File> =
        new EventEmitter();

    editDescription: boolean;

    menuAnchor: HTMLElement;
    menuItem: any;
    showNewOptions: boolean;
    showFileOptions: boolean;
    operation: "rename" | "move";
    operationLoading = false;
    operationError = "";
    operationControl = new UntypedFormControl("");
    folderDestinations: string[] = [];

    componentDestroyed$ = new Subject<void>();

    currentNode$: BehaviorSubject<DirectoryNode> =
        new BehaviorSubject<DirectoryNode>(null);

    directoryTree: DirectoryTree = new DirectoryTree();
    directoryTree$: BehaviorSubject<DirectoryTree> = new BehaviorSubject(
        this.directoryTree,
    );

    constructor(
        private fileService: FileService,
        private toaster: ToastrOvenService,
    ) {}

    ngOnInit() {
        this.files$
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((files) => {
                // If there are files, add them to the directory tree
                // Upon creating a new learning object there will be no files
                // so we don't want to throw an error with 'addFiles'
                if (files) {
                    this.directoryTree = new DirectoryTree();
                    this.directoryTree.addFiles(files);
                    this.directoryTree$.next(this.directoryTree);
                }
            });
    }

    /**
     * Emits clicked file
     *
     * @param {LearningObject.Material.File} file
     * @memberof FileManagerComponent
     */
    handleDownloadClick(file: LearningObject.Material.File) {
        this.downloadClicked.emit(file);
    }
    /**
     * Triggers new options context menu
     *
     * @param {MouseEvent} $event
     * @memberof FileManagerComponent
     */
    openNewOptions($event: MouseEvent): void {
        this.closeContextMenu();
        this.menuAnchor = $event.target as HTMLElement;
        this.showNewOptions = true;
    }

    /**
     * Triggers file options context menu
     *
     * @param {MouseEvent} $event
     * @memberof FileManagerComponent
     */
    openFileOptions(params: { event: MouseEvent; item: any }): void {
        this.closeContextMenu();
        this.menuItem = params.item;
        this.menuAnchor = params.event.target as HTMLElement;
        this.showFileOptions = true;
    }

    isDirectory(item: any): boolean {
        return item instanceof DirectoryNode;
    }

    openOperation(operation: "rename" | "move"): void {
        this.operation = operation;
        if (operation === "rename") {
            this.operationControl.setValue(
                this.isDirectory(this.menuItem)
                    ? this.menuItem.getName()
                    : this.menuItem.name,
            );
        } else {
            this.folderDestinations = [""];
            this.collectFolderDestinations(
                this.directoryTree.traversePath([]),
                this.folderDestinations,
            );
            this.operationControl.setValue(
                this.getParentPath(
                    this.menuItem.fullPath || this.menuItem.name,
                ),
            );
        }
        this.operationError = "";
        this.closeContextMenu(true);
    }

    cancelOperation(): void {
        if (this.operationLoading) return;
        this.operation = undefined;
        this.operationError = "";
        this.menuItem = undefined;
    }

    submitOperation(event: SubmitEvent): void {
        event.preventDefault();
        if (this.operationLoading) return;
        void (this.operation === "rename"
            ? this.submitRename()
            : this.submitMove());
    }

    async submitRename(): Promise<void> {
        if (this.operationLoading) return;

        const item = this.menuItem;
        if (!item) {
            this.operationError =
                "The selected item is no longer available. Close this dialog and try again.";
            return;
        }
        const isFolder = this.isDirectory(item);
        const originalName = isFolder ? item.getName() : item.name;
        const name = `${this.operationControl.value || ""}`.trim();
        const validationError = validateMaterialName(
            name,
            originalName,
            !isFolder,
        );
        if (validationError) {
            this.operationError = validationError;
            return;
        }
        if (this.destinationNameExists(item, name)) {
            this.operationError = "An item with that name already exists here.";
            return;
        }

        await this.runOperation(
            () =>
                isFolder
                    ? this.fileService
                          .renameFolder(
                              this.learningObjectId,
                              item.getPath(),
                              name,
                          )
                          .toPromise()
                    : this.fileService
                          .renameFile(this.learningObjectId, item._id, name)
                          .toPromise(),
            () => this.applyRename(item, name),
            "Renamed",
        );
    }

    async submitMove(): Promise<void> {
        if (this.operationLoading) return;

        const file = this.menuItem as LearningObject.Material.File;
        if (!file) {
            this.operationError =
                "The selected file is no longer available. Close this dialog and try again.";
            return;
        }
        const destinationPath = `${this.operationControl.value || ""}`;
        const currentParent = this.getParentPath(file.fullPath || file.name);
        if (destinationPath === currentParent) {
            this.operationError = "Choose a different destination.";
            return;
        }
        const destination = this.directoryTree.traversePath(
            destinationPath ? destinationPath.split("/") : [],
        );
        if (destination?.getFiles().some((item) => item.name === file.name)) {
            this.operationError =
                "A file with that name already exists in the destination.";
            return;
        }

        await this.runOperation(
            () =>
                this.fileService
                    .moveFile(this.learningObjectId, file._id, destinationPath)
                    .toPromise(),
            () => {
                file.fullPath = destinationPath
                    ? `${destinationPath}/${file.name}`
                    : file.name;
                this.refreshFiles();
            },
            "Moved",
        );
    }

    private async runOperation(
        createRequest: () => Promise<unknown>,
        applyChange: () => void,
        successTitle: string,
    ): Promise<void> {
        if (this.operationLoading) return;

        this.operationLoading = true;
        this.operationError = "";
        try {
            await createRequest();
            applyChange();
            this.toaster.success(
                successTitle,
                "The file explorer was updated.",
            );
            this.operation = undefined;
            this.menuItem = undefined;
        } catch (error) {
            this.operationError =
                error?.error?.message ||
                error?.message ||
                "The change could not be saved. Please try again.";
        } finally {
            this.operationLoading = false;
        }
    }

    private applyRename(
        item: DirectoryNode | LearningObject.Material.File,
        name: string,
    ): void {
        if (!(item instanceof DirectoryNode)) {
            const parentPath = this.getParentPath(item.fullPath || item.name);
            item.name = name;
            item.fullPath = parentPath ? `${parentPath}/${name}` : name;
            this.refreshFiles();
            return;
        }

        const oldPath = item.getPath();
        const parentPath = this.getParentPath(oldPath);
        const newPath = parentPath ? `${parentPath}/${name}` : name;
        this.files$.value.forEach((file) => {
            if (file.fullPath?.startsWith(`${oldPath}/`)) {
                file.fullPath = `${newPath}${file.fullPath.slice(oldPath.length)}`;
            }
        });
        const descriptions = this.folderMeta$.value || [];
        descriptions.forEach((folder) => {
            if (
                folder.path === oldPath ||
                folder.path.startsWith(`${oldPath}/`)
            ) {
                folder.path = `${newPath}${folder.path.slice(oldPath.length)}`;
            }
        });
        this.folderMeta$.next([...descriptions]);
        this.refreshFiles();
    }

    private refreshFiles(): void {
        this.files$.next([...(this.files$.value || [])]);
    }

    private destinationNameExists(
        item: DirectoryNode | LearningObject.Material.File,
        name: string,
    ): boolean {
        const parent =
            item instanceof DirectoryNode
                ? item.getParent()
                : this.directoryTree.traversePath(
                      this.getParentPath(item.fullPath || item.name)
                          .split("/")
                          .filter(Boolean),
                  );
        return (
            parent?.getFolders().some((folder) => folder.getName() === name) ||
            parent?.getFiles().some((file) => file.name === name)
        );
    }

    private collectFolderDestinations(
        node: DirectoryNode,
        destinations: string[],
    ): void {
        node.getFolders().forEach((folder) => {
            destinations.push(folder.getPath());
            this.collectFolderDestinations(folder, destinations);
        });
    }

    private getParentPath(path: string): string {
        return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    }

    /**
     * Closes all context menus
     *
     * @memberof FileManagerComponent
     */
    closeContextMenu(preserveItem = false) {
        this.showNewOptions = false;
        this.showFileOptions = false;
        this.menuAnchor = undefined;

        if (!this.editDescription && !preserveItem && !this.operation) {
            this.menuItem = undefined;
        }
    }

    /**
     * Emits file edit
     *
     * @param {string} description
     * @param {(LearningObject.Material.File | DirectoryNode)} file
     * @returns
     * @memberof FileManagerComponent
     */
    saveDescription(
        description: string,
        file: LearningObject.Material.File | DirectoryNode,
    ) {
        if (!file) {
            return;
        }
        const edit: FileEdit = {
            id: "",
            path: "",
            description: description,
        };

        if (!(file instanceof DirectoryNode)) {
            edit.id = file._id;
        } else {
            edit.path = file.getPath();
            edit.isFolder = true;
        }

        this.fileEdited.emit(edit);
    }

    /**
     * Marks files for deletion in filesystem and emits deletion event up to parent
     */
    triggerDelete(file: DirectoryNode | File) {
        let scheduledDeletions: string[] = [];
        let name: string;
        let isFolder = false;

        if (!(file instanceof DirectoryNode)) {
            // @ts-ignore
            scheduledDeletions = [file._id];
            name = file.name;
        } else {
            const folder = file;
            scheduledDeletions = this.getFileIds(folder);
            name = folder.getName();
            isFolder = true;
        }

        this.fileDeleted.emit(scheduledDeletions);

        this.deletionSuccessful$
            .pipe(takeUntil(this.componentDestroyed$), take(1))
            .subscribe((files) => {
                if (files === scheduledDeletions) {
                    const node = this.currentNode$.getValue();

                    if (isFolder) {
                        node.removeFolder(name);
                    } else {
                        node.removeFile(name);
                    }

                    this.currentNode$.next(node);
                }
            });
    }

    /**
     * Recursively gets all ids of files in folder
     *
     * @param {DirectoryNode} folder
     * @returns {string[]}
     * @memberof FileManagerComponent
     */
    getFileIds(folder: DirectoryNode): string[] {
        const children = folder.getFolders();
        const files = folder.getFiles();
        if (!children.length && !files.length) {
            return [];
        }
        let fileIds = [];
        for (const file of files) {
            fileIds.push(file._id);
        }
        for (const child of children) {
            fileIds = [...fileIds, ...this.getFileIds(child)];
        }
        return fileIds;
    }
    /**
     * Opens Folder upload dialog
     *
     * @param {boolean} [fromRoot]
     * @memberof FileManagerComponent
     */
    openFolderDialog(fromRoot?: boolean) {
        this.openFilePicker.emit(true);
        if (fromRoot) {
            this.path.emit();
        }
    }
    /**
     * Opens File Upload Dialog
     *
     * @param {boolean} [fromRoot]
     * @memberof FileManagerComponent
     */
    openFileDialog(fromRoot?: boolean) {
        this.openFilePicker.emit(false);
        if (fromRoot) {
            this.path.emit();
        }
    }
    /**
     * Emits current path
     *
     * @param {string} path
     * @memberof FileManagerComponent
     */
    emitPath(path: string) {
        this.path.emit(path);
    }

    ngOnDestroy() {
        this.componentDestroyed$.next();
        this.componentDestroyed$.unsubscribe();
    }
}
