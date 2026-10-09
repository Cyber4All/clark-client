import {
    AfterViewInit,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    Output,
    Renderer2,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import { NgFor } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
    BOLD_BUTTON,
    EditorComponent,
    ExecCommand,
    ITALIC_BUTTON,
    NgxSimpleTextEditorModule,
    ORDERED_LIST_BUTTON,
    UNDERLINE_BUTTON,
    UNORDERED_LIST_BUTTON,
} from "ngx-simple-text-editor";

@Component({
    selector: "clark-rating-editor",
    standalone: true,
    imports: [NgFor, FormsModule, NgxSimpleTextEditorModule],
    templateUrl: "./rating-editor.component.html",
    styleUrls: ["./rating-editor.component.scss"],
    host: {
        "(beforeinput)": "blockRawMarkupInput($event)",
        "(paste)": "pastePlainText($event)",
    },
})
export class RatingEditorComponent implements AfterViewInit, OnChanges {
    @Input() value = "";
    @Input() placeholder = "Why did you leave this rating?";
    @Output() valueChange = new EventEmitter<string>();
    @ViewChild(EditorComponent) editor: EditorComponent;

    selectedHeading = "p";
    editorContent = "";
    // The visible toolbar is Angular-owned, so it needs its own active-state map.
    activeCommands: Partial<Record<ExecCommand, boolean>> = {};
    // Keep the review toolbar intentionally limited to the controls approved for ratings.
    readonly buttons = [
        BOLD_BUTTON,
        ITALIC_BUTTON,
        UNDERLINE_BUTTON,
        ORDERED_LIST_BUTTON,
        UNORDERED_LIST_BUTTON,
    ];
    // An empty library toolbar leaves the editable surface intact; this component
    // renders the visible toolbar above so it can participate in Angular bindings.
    config = { placeholder: this.placeholder, buttons: [] };
    private editorSelection: Range | null = null;
    // Inline sizes preserve mixed styles on one line; the library uses sizes 1–7.
    private readonly headingSizes: Record<string, string> = {
        p: "3",
        h1: "6",
        h2: "5",
        h3: "4",
    };

    constructor(private renderer: Renderer2) {}

    ngOnChanges(changes: SimpleChanges): void {
        // The third-party editor reads its placeholder from the config object.
        if (changes.placeholder)
            this.config = { ...this.config, placeholder: this.placeholder };
        if (
            changes.value &&
            (changes.value.currentValue || "") !== this.editorContent
        ) {
            // An external reset must not leave a range pointing at removed content.
            this.editorSelection = null;
            this.editorContent = changes.value.currentValue || "";
            this.selectedHeading = "p";
            this.activeCommands = {};
        }
    }

    ngAfterViewInit(): void {
        // Use the editor's public element reference; no queries into or reparenting
        // of its toolbar. The library renders a div, so supply textbox semantics.
        const area = this.editor.contentEditable.nativeElement;
        this.renderer.setAttribute(area, "role", "textbox");
        this.renderer.setAttribute(area, "aria-label", this.placeholder);
        this.renderer.setAttribute(area, "aria-multiline", "true");
    }

    onValueChange(value: string): void {
        // The library's DOM observer also reports external writes. Do not echo
        // those as user edits (for example, when a parent resets the form).
        if ((value || "") !== (this.value || ""))
            this.valueChange.emit(value || "");
    }

    execute(command: ExecCommand, value?: string): void {
        const area: HTMLElement = this.editor.contentEditable.nativeElement;
        area.focus();
        if (
            this.editorSelection &&
            area.contains(this.editorSelection.commonAncestorContainer)
        ) {
            const selection = area.ownerDocument.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.editorSelection);
        }
        this.editor.execCommand(command, value);
        this.emitValue();
        this.updateHeading();
    }

    private emitValue(): void {
        // Use the value accessor's edit path; writing the same HTML back through
        // writeValue replaces the DOM and invalidates native undo history.
        this.editor.domModify();
    }

    blockRawMarkupInput(event: InputEvent): void {
        const area: HTMLElement = this.editor?.contentEditable?.nativeElement;
        if (
            !area?.contains(event.target as Node) ||
            !event.data ||
            !/[<>]/.test(event.data)
        ) {
            return;
        }

        // Formatting belongs to the toolbar and keyboard shortcuts. Blocking angle
        // brackets while typing prevents a reviewer from entering raw HTML markup.
        event.preventDefault();
    }

    pastePlainText(event: ClipboardEvent): void {
        const area: HTMLElement = this.editor?.contentEditable?.nativeElement;
        const pastedText = event.clipboardData?.getData("text/plain") || "";
        if (
            !area?.contains(event.target as Node) ||
            !/<\/?[a-z][^>]*>/i.test(pastedText)
        ) {
            return;
        }

        event.preventDefault();
        // A template is inert, so it can safely turn pasted tag markup into its
        // readable text before the native editor inserts it at the current caret.
        const template = area.ownerDocument.createElement("template");
        template.innerHTML = pastedText;
        this.editor.execCommand(
            ExecCommand.insertText,
            template.content.textContent || "",
        );
        this.emitValue();
        this.updateHeading();
    }

    @HostListener("input", ["$event"])
    rememberTypingSelection(event: Event): void {
        const area: HTMLElement = this.editor?.contentEditable?.nativeElement;
        // The heading select also emits input; treating that as typing resets its choice.
        if (area?.contains(event.target as Node)) this.updateHeading();
    }

    @HostListener("keydown", ["$event"])
    handleEditorShortcut(event: KeyboardEvent): void {
        const area: HTMLElement = this.editor?.contentEditable?.nativeElement;
        if (
            !area?.contains(event.target as Node) ||
            event.defaultPrevented ||
            event.isComposing ||
            event.altKey ||
            !(event.ctrlKey || event.metaKey)
        )
            return;

        const key = event.key.toLowerCase();
        const commands: Record<string, ExecCommand> = {
            b: ExecCommand.bold,
            i: ExecCommand.italic,
            u: ExecCommand.underline,
            z: ExecCommand.undo,
            y: ExecCommand.redo,
        };
        const command = event.shiftKey
            ? key === "z"
                ? ExecCommand.redo
                : undefined
            : commands[key];
        if (!command) return;

        // Consume the browser shortcut so formatting/history executes once, only
        // in this editable area. Native copy, paste and selection remain intact.
        event.preventDefault();
        if (event.repeat) return;
        this.editor.execCommand(command);
        // Synchronize submitted HTML immediately after formatting or history changes.
        this.emitValue();
        this.updateHeading();
    }

    @HostListener("document:selectionchange")
    updateHeading(): void {
        const area: HTMLElement = this.editor?.contentEditable?.nativeElement;
        const selection = area?.ownerDocument.getSelection();
        if (!selection?.rangeCount || !area.contains(selection.anchorNode)) {
            return;
        }
        this.editorSelection = selection.getRangeAt(0).cloneRange();
        // The library only tracks its hidden toolbar. Mirror formatting state for
        // the Angular-owned buttons whenever the caret or selection changes.
        for (const button of this.buttons) {
            this.activeCommands[button.command] =
                area.ownerDocument.queryCommandState(button.command);
        }
        // Query the pending typing size too: an empty caret has no styled DOM node yet.
        const size = area.ownerDocument.queryCommandValue("fontSize");
        this.selectedHeading =
            Object.keys(this.headingSizes).find(
                (heading) => this.headingSizes[heading] === size,
            ) || "p";
    }

    applyHeading(value: string): void {
        const area: HTMLElement = this.editor?.contentEditable?.nativeElement;
        if (!area || !["p", "h1", "h2", "h3"].includes(value)) {
            return;
        }
        area.focus();
        // A native select takes focus away from the editable text. Restore its range
        // before setting the typing style. A selected range is formatted explicitly;
        // a collapsed caret affects only subsequent typing, not its whole paragraph.
        if (
            this.editorSelection &&
            area.contains(this.editorSelection.commonAncestorContainer)
        ) {
            const selection = area.ownerDocument.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.editorSelection);
        }
        // Inline font attributes survive Angular sanitization and don't create a
        // new block/blank line when switching back to Paragraph.
        const document = area.ownerDocument;
        const styledWithCSS = document.queryCommandState("styleWithCSS");
        document.execCommand("styleWithCSS", false, "false");
        if (document.queryCommandState("bold") !== (value !== "p")) {
            this.editor.execCommand(ExecCommand.bold);
        }
        this.editor.execCommand(ExecCommand.fontSize, this.headingSizes[value]);
        document.execCommand("styleWithCSS", false, String(styledWithCSS));
        this.selectedHeading = value;
        this.emitValue();
        this.updateHeading();
    }
}
