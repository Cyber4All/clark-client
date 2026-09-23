/* eslint-disable @typescript-eslint/naming-convention */
import {
    Input,
    Output,
    EventEmitter,
    Component,
    OnChanges,
    SimpleChanges,
    OnInit,
} from "@angular/core";

import {
    BOLD_BUTTON,
    EditorSelect,
    ExecCommand,
    ITALIC_BUTTON,
    LINK_INPUT,
    ORDERED_LIST_BUTTON,
    REMOVE_FORMAT_BUTTON,
    UNDERLINE_BUTTON,
    UNORDERED_LIST_BUTTON,
    NgxSimpleTextEditorModule,
    SEPARATOR,
    ToolbarItemType,
} from "ngx-simple-text-editor";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";

// formatBlock applies semantic headings instead of inline font sizes.
const HEADING_SELECT: EditorSelect = {
    type: ToolbarItemType.Select,
    command: ExecCommand.formatBlock,
    title: "heading size",
    items: [
        { value: "p", label: "Paragraph" },
        // The editor reports a bare text block as div when no paragraph tag exists.
        { value: "div", label: "Paragraph" },
        // queryCommandValue can be empty while the user is typing plain text.
        { value: "", label: "Paragraph" },
        { value: "h1", label: "Heading 1" },
        { value: "h2", label: "Heading 2" },
        { value: "h3", label: "Heading 3" },
    ],
};

@Component({
    selector: "clark-text-editor",
    template: `
        <div *ngIf="showBox">
            <st-editor
                [(ngModel)]="editorContent"
                (ngModelChange)="onChange()"
                [config]="config"></st-editor>
        </div>
    `,
    styles: [
        `
            #cke_bottom_detail,
            .cke_bottom {
                display: none;
            }

            :host {
                display: block;
                width: 100%;
                min-width: 0;
            }

            /* Response editors still use this wrapper; keep wrapping scoped to it. */
            :host ::ng-deep .st-area,
            :host ::ng-deep .st-area * {
                overflow-wrap: anywhere;
                white-space: pre-wrap;
            }
        `,
    ],
    standalone: true,
    imports: [NgIf, FormsModule, NgxSimpleTextEditorModule],
})
export class TextEditorComponent implements OnInit, OnChanges {
    @Input() savedContent: string;
    @Input() editorPlaceholder: string;

    @Output() textOutput: EventEmitter<string> = new EventEmitter();
    @Output() touched: EventEmitter<void> = new EventEmitter();

    editorContent: string;
    buttonText: string;

    showBox = true;
    config = {
        placeholder: "What changes were made to this Learning Object?",
        buttons: [
            BOLD_BUTTON,
            ITALIC_BUTTON,
            UNDERLINE_BUTTON,
            SEPARATOR,
            REMOVE_FORMAT_BUTTON,
            SEPARATOR,
            HEADING_SELECT,
            SEPARATOR,
            ORDERED_LIST_BUTTON,
            UNORDERED_LIST_BUTTON,
            SEPARATOR,
            LINK_INPUT,
        ],
    };

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.editorPlaceholder) {
            this.config = {
                ...this.config,
                placeholder:
                    changes.editorPlaceholder.currentValue ||
                    "What changes were made to this Learning Object?",
            };
        }

        if (changes.savedContent) {
            // Updating the input does not emit ngModelChange; only user edits emit output.
            // Accept empty values too, so clearing/reusing a form resets the editor.
            this.editorContent = changes.savedContent.currentValue || "";
        }
    }

    ngOnInit() {
        if (this.savedContent) {
            this.buttonText = "Show Content";
        } else {
            this.buttonText = "Add Content";
        }
    }

    onChange() {
        // The editor emits its HTML after every user edit, including the first one.
        this.textOutput.emit(this.editorContent || "");
        this.touched.emit();
    }

    toggleBox() {
        this.showBox = !this.showBox;
        if (this.showBox === false && !this.savedContent) {
            this.buttonText = "Add Content";
        } else if (this.showBox === false && this.savedContent) {
            this.buttonText = "Show Content";
        } else {
            this.buttonText = "Hide Content";
        }
    }
}
