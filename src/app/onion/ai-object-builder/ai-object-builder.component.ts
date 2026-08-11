import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivateDirective } from "../../shared/directives/activate.directive";
import { ContextMenuComponent } from "../../shared/modules/contextmenu/context-menu/context-menu.component";

type TreeNodeType = "folder" | "file";

interface TreeNode {
    id: string;
    name: string;
    type: TreeNodeType;
    children?: TreeNode[];
    file?: {
        size?: number;
        mimeType?: string;
        modifiedAt?: string;
    };
}

interface VisibleTreeNode {
    node: TreeNode;
    level: number;
}

interface UploadedFile {
    id: string;
    parentId: string;
    file: File;
}

interface ActionMenu {
    nodeId: string;
    nodeType: TreeNodeType;
}

@Component({
    selector: "clark-ai-object-builder",
    templateUrl: "./ai-object-builder.component.html",
    styleUrls: ["./ai-object-builder.component.scss"],
    standalone: true,
    imports: [
        ContextMenuComponent,
        ActivateDirective,
        FormsModule,
        NgClass,
        NgFor,
        NgIf,
    ],
})
export class AiObjectBuilderComponent {
    @ViewChild("fileInput") fileInput?: ElementRef<HTMLInputElement>;

    readonly acceptedFileTypes = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt";
    readonly acceptedFileTypeLabel =
        "Supports PDF, DOCX, PPTX, XLSX, TXT and more";
    readonly baseTree: TreeNode[] = [
        {
            id: "course-materials",
            name: "Course Materials",
            type: "folder",
            children: [
                {
                    id: "module-1",
                    name: "Module 1",
                    type: "folder",
                    children: [],
                },
                {
                    id: "module-2",
                    name: "Module 2",
                    type: "folder",
                    children: [],
                },
            ],
        },
        {
            id: "assessments",
            name: "Assessments",
            type: "folder",
            children: [],
        },
        {
            id: "images",
            name: "Images",
            type: "folder",
            children: [],
        },
    ];

    uploadedFiles: UploadedFile[] = [];
    guidance = "";
    isDragActive = false;
    selectedFolderId = "course-materials";
    expandedFolderIds = new Set<string>();
    activeActionMenu?: ActionMenu;
    actionMenuAnchor?: HTMLElement;

    constructor(private router: Router) {}

    get hasFiles(): boolean {
        return this.uploadedFiles.length > 0;
    }

    get tree(): TreeNode[] {
        return this.attachUploadedFiles(this.baseTree);
    }

    get selectedFolder(): TreeNode {
        const selectedNode = this.findNode(this.selectedFolderId);

        if (selectedNode?.type === "folder") {
            return selectedNode;
        }

        return this.tree[0];
    }

    get visibleTreeNodes(): VisibleTreeNode[] {
        const visibleNodes: VisibleTreeNode[] = [];

        this.tree.forEach((node) => {
            this.collectVisibleNodes(node, 1, visibleNodes);
        });

        return visibleNodes;
    }

    get breadcrumbNodes(): TreeNode[] {
        return this.findPath(this.selectedFolderId) || [this.selectedFolder];
    }

    get currentRows(): TreeNode[] {
        return this.selectedFolder.children || [];
    }

    saveAndReturn(): void {
        this.router.navigate(["/onion/dashboard"]);
    }

    openFilePicker(): void {
        this.fileInput?.nativeElement.click();
    }

    onFileInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;

        this.addFiles(input.files);
        input.value = "";
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        this.isDragActive = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        this.isDragActive = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragActive = false;
        this.addFiles(event.dataTransfer?.files);
    }

    onDropzoneKeydown(event: KeyboardEvent): void {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.openFilePicker();
        }
    }

    buildLearningObject(): void {
        if (!this.hasFiles) {
            return;
        }
    }

    onTreeNodeClick(node: TreeNode): void {
        if (node.type !== "folder") {
            return;
        }

        this.selectFolder(node.id);
        this.toggleExpanded(node);
    }

    onChevronClick(node: TreeNode, event: Event): void {
        event.stopPropagation();
        this.toggleExpanded(node);
    }

    onTableNodeClick(node: TreeNode): void {
        if (node.type !== "folder") {
            return;
        }

        this.selectFolder(node.id);
        this.toggleExpanded(node);
    }

    selectFolder(folderId: string): void {
        const folder = this.findNode(folderId);

        if (folder?.type !== "folder") {
            return;
        }

        this.selectedFolderId = folderId;
        this.activeActionMenu = undefined;
    }

    toggleActionMenu(node: TreeNode, event: MouseEvent): void {
        event.stopPropagation();

        if (this.activeActionMenu?.nodeId === node.id) {
            this.closeActionMenu();
            return;
        }

        this.activeActionMenu = {
            nodeId: node.id,
            nodeType: node.type,
        };
        this.actionMenuAnchor = event.currentTarget as HTMLElement;
    }

    closeActionMenu(): void {
        this.activeActionMenu = undefined;
        this.actionMenuAnchor = undefined;
    }

    get activeActionNode(): TreeNode | undefined {
        if (!this.activeActionMenu) {
            return undefined;
        }

        return this.findNode(this.activeActionMenu.nodeId);
    }

    getActionMenuOptions(node?: TreeNode): string[] {
        if (!node) {
            return [];
        }

        if (node.type === "folder") {
            return ["Open", "Rename", "Move to...", "Delete folder"];
        }

        return ["Preview", "Rename", "Move to...", "Remove"];
    }

    isActionEnabled(option: string): boolean {
        return option === "Open" || option === "Remove";
    }

    handleAction(option: string, node: TreeNode): void {
        if (!this.isActionEnabled(option)) {
            return;
        }

        if (option === "Open" && node.type === "folder") {
            this.selectFolder(node.id);
            this.closeActionMenu();
            return;
        }

        if (option === "Remove" && node.type === "file") {
            this.removeFile(node.id);
            this.closeActionMenu();
        }
    }

    addFiles(fileList?: FileList | File[] | null): void {
        if (!fileList?.length) {
            return;
        }

        const nextFiles = Array.from(fileList).map((file, index) => ({
            id: `${Date.now()}-${index}-${file.name}`,
            parentId: this.selectedFolderId,
            file,
        }));

        this.uploadedFiles = [...this.uploadedFiles, ...nextFiles];
        this.expandedFolderIds.add(this.selectedFolderId);
    }

    removeFile(fileId: string): void {
        this.uploadedFiles = this.uploadedFiles.filter(
            ({ id }) => id !== fileId,
        );
    }

    hasChildren(node: TreeNode): boolean {
        return Boolean(node.children?.length);
    }

    isExpanded(node: TreeNode): boolean {
        return this.expandedFolderIds.has(node.id);
    }

    getNodeTypeLabel(node: TreeNode): string {
        if (node.type === "folder") {
            return "Folder";
        }

        return this.getFileType(node.name);
    }

    getNodeSizeLabel(node: TreeNode): string {
        if (node.type === "folder") {
            return "-";
        }

        return this.formatBytes(node.file?.size || 0);
    }

    getNodeModifiedLabel(node: TreeNode): string {
        if (node.type === "folder") {
            return "May 14, 2024";
        }

        return node.file?.modifiedAt || "Today";
    }

    getNodeIconClass(node: TreeNode): string {
        if (node.type === "folder") {
            return "fa-regular fa-folder ai-object-builder__file-icon--folder";
        }

        return this.getFileIconClass(node.name);
    }

    trackNodeById(_index: number, item: TreeNode | VisibleTreeNode): string {
        return "node" in item ? item.node.id : item.id;
    }

    private toggleExpanded(node: TreeNode): void {
        if (!this.hasChildren(node)) {
            return;
        }

        if (this.expandedFolderIds.has(node.id)) {
            this.expandedFolderIds.delete(node.id);
            return;
        }

        this.expandedFolderIds.add(node.id);
    }

    private collectVisibleNodes(
        node: TreeNode,
        level: number,
        visibleNodes: VisibleTreeNode[],
    ): void {
        visibleNodes.push({ node, level });

        if (!this.expandedFolderIds.has(node.id)) {
            return;
        }

        node.children?.forEach((child) => {
            this.collectVisibleNodes(child, level + 1, visibleNodes);
        });
    }

    private attachUploadedFiles(nodes: TreeNode[]): TreeNode[] {
        return nodes.map((node) => {
            const children = this.attachUploadedFiles(node.children || []);
            const files = this.uploadedFiles
                .filter(({ parentId }) => parentId === node.id)
                .map((upload) => this.toFileNode(upload));

            return {
                ...node,
                children: [...children, ...files],
            };
        });
    }

    private toFileNode(upload: UploadedFile): TreeNode {
        return {
            id: upload.id,
            name: upload.file.name,
            type: "file",
            file: {
                size: upload.file.size,
                mimeType: upload.file.type,
                modifiedAt: "Today",
            },
        };
    }

    private findNode(nodeId: string, nodes = this.tree): TreeNode | undefined {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return node;
            }

            const matchingChild = this.findNode(nodeId, node.children || []);

            if (matchingChild) {
                return matchingChild;
            }
        }

        return undefined;
    }

    private findPath(
        nodeId: string,
        nodes = this.tree,
    ): TreeNode[] | undefined {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return [node];
            }

            const childPath = this.findPath(nodeId, node.children || []);

            if (childPath) {
                return [node, ...childPath];
            }
        }

        return undefined;
    }

    private formatBytes(size: number): string {
        if (size < 1024) {
            return `${size} B`;
        }

        const kilobytes = size / 1024;

        if (kilobytes < 1024) {
            return `${Math.round(kilobytes)} KB`;
        }

        return `${(kilobytes / 1024).toFixed(1)} MB`;
    }

    private getFileType(fileName: string): string {
        return fileName.split(".").pop()?.toUpperCase() || "File";
    }

    private getFileIconClass(fileName: string): string {
        switch (fileName.split(".").pop()?.toLowerCase()) {
            case "pdf":
                return "fa-solid fa-file-pdf ai-object-builder__file-icon--pdf";
            case "doc":
            case "docx":
                return "fa-solid fa-file-word ai-object-builder__file-icon--word";
            case "ppt":
            case "pptx":
                return "fa-solid fa-file-powerpoint ai-object-builder__file-icon--powerpoint";
            case "txt":
                return "fa-solid fa-file-lines ai-object-builder__file-icon--text";
            case "xls":
            case "xlsx":
                return "fa-solid fa-file-excel ai-object-builder__file-icon--spreadsheet";
            default:
                return "fa-solid fa-file ai-object-builder__file-icon--default";
        }
    }
}
