import {
    RATING_COMMENT_LIMIT,
    ratingCommentLength,
    ratingCommentText,
    serializeRatingComment,
} from "../rating-comment";
import {
    Component,
    OnInit,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    EventEmitter,
    HostListener,
    ViewChild,
    AfterViewInit,
    ElementRef,
    Renderer2,
} from "@angular/core";
import { NgClass, NgFor } from "@angular/common";
import { TipDirective } from "../../../../shared/directives/tip.directive";
import { ActivateDirective } from "../../../../shared/directives/activate.directive";
import { FormsModule } from "@angular/forms";
import {
    BOLD_BUTTON,
    EditorComponent,
    ExecCommand,
    ITALIC_BUTTON,
    LINK_INPUT,
    NgxSimpleTextEditorModule,
    ORDERED_LIST_BUTTON,
    SEPARATOR,
    UNDERLINE_BUTTON,
    UNORDERED_LIST_BUTTON,
} from "ngx-simple-text-editor";

@Component({
    selector: "clark-new-rating",
    templateUrl: "./new-rating.component.html",
    styleUrls: ["./new-rating.component.scss"],
    standalone: true,
    imports: [
        NgClass,
        NgFor,
        TipDirective,
        ActivateDirective,
        FormsModule,
        NgxSimpleTextEditorModule,
    ],
})
export class NewRatingComponent implements OnInit, OnChanges, AfterViewInit {
    @ViewChild(EditorComponent) editor: EditorComponent;
    @ViewChild("headingControl") headingControl: ElementRef<HTMLElement>;
    selectedHeading = "p";
    private editorSelection: Range | null = null;
    // Native fontSize uses legacy sizes 1–7, not pixel values. Inline sizes let
    // a heading and paragraph share a line without reformatting the whole block.
    private readonly headingSizes: Record<string, string> = {
        p: "3",
        h1: "6",
        h2: "5",
        h3: "4",
    };
    @Input() count = 5;
    @Input() rating: { value: number; comment: string; id: string };
    @Input() editing = false;
    @Output() setRating: EventEmitter<{
        value: number;
        comment: string;
        id?: string;
        editing?: boolean;
    }> = new EventEmitter();
    @Output() cancelRating: EventEmitter<void> = new EventEmitter();
    iterableCount: Array<any>;

    tips = ["Poor", "Needs Work", "Average", "Good", "Excellent"];

    activeHover = -1;
    activePanel = 0;

    oldRating: number;

    readonly editorConfig = {
        placeholder: "Why did you leave this rating?",
        buttons: [
            BOLD_BUTTON,
            ITALIC_BUTTON,
            UNDERLINE_BUTTON,
            SEPARATOR,
            ORDERED_LIST_BUTTON,
            UNORDERED_LIST_BUTTON,
            SEPARATOR,
            LINK_INPUT,
        ],
    };

    constructor(private renderer: Renderer2) {}

    ngAfterViewInit(): void {
        // The library has no toolbar projection slot. Move our Angular-owned
        // control into its toolbar; its bindings and selection handling stay intact.
        const toolbar =
            this.editor.contentEditable.nativeElement.parentElement.querySelector(
                ".st-toolbar",
            ) as HTMLElement;
        if (toolbar) {
            this.renderer.insertBefore(
                toolbar,
                this.headingControl.nativeElement,
                toolbar.firstChild,
            );
        }
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
        this.editor.domModify();
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
    }

    readonly commentLimit = RATING_COMMENT_LIMIT;

    get commentLength(): number {
        return ratingCommentLength(this.rating?.comment);
    }

    get isSubmitDisabled(): boolean {
        // Empty editor markup is not a review; the limit counts decoded text, not HTML.
        return (
            !ratingCommentText(this.rating?.comment).trim() ||
            this.commentLength > this.commentLimit
        );
    }

    ngOnInit() {
        this.iterableCount = Array(this.count).fill(0);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.count) {
            this.iterableCount = Array(changes.count.currentValue).fill(0);
        }

        if (changes.rating) {
            if (!changes.rating.isFirstChange || changes.rating.currentValue) {
                this.advance();
            }
        }
    }

    regress() {
        this.activePanel = 0;
    }

    advance() {
        this.activePanel = 1;
    }

    setHover(i: number) {
        this.activeHover = i;
    }

    reset() {
        // reset the hover
        this.activeHover = -1;
    }

    rate(i: number) {
        this.rating.value = i;
        this.activePanel = 1;
        this.activeHover = -1;
    }

    submitRating() {
        if (this.isSubmitDisabled) {
            return;
        }
        this.setRating.emit({
            ...this.rating,
            // Convert only on submission so normalizing markup cannot move the live caret.
            comment: serializeRatingComment(this.rating.comment),
            editing: this.editing,
        });
    }

    cancel() {
        this.cancelRating.emit();
    }

    starShouldShow(i: number): boolean {
        return (
            (this.activeHover !== -1 && i <= this.activeHover) ||
            (this.activeHover === -1 && this.rating && i < this.rating.value)
        );
    }
}
