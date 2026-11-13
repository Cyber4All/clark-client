import { NgFor, NgIf, TitleCasePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from "@angular/forms";
import { A11yModule } from "@angular/cdk/a11y";
import { LearningObject } from "@entity";
import { LENGTH_ORDER, isValidChildLength } from "../hierarchy-length.util";
import { NewChildRequest } from "../hierarchy-tree.types";

/** Shown for a name that has a character the API refuses. */
export const INVALID_NAME_MESSAGE =
    'Names cannot contain any of these characters: / \\ * " |';

/** Same character set the API refuses (see `HierarchyEditService`). */
const INVALID_NAME = /[\\/"*|]/;

/** Angular validator: a name that is blank after trimming. */
function notBlank(control: AbstractControl): ValidationErrors | null {
    return String(control.value ?? "").trim() ? null : { blank: true };
}

/** Angular validator: a name with a character the API refuses. */
function allowedCharacters(control: AbstractControl): ValidationErrors | null {
    return INVALID_NAME.test(String(control.value ?? ""))
        ? { characters: true }
        : null;
}

/**
 * Dialog for creating a new learning object as a child (sc-40236). Rendered in
 * a CDK Overlay owned by `HierarchyTreeComponent`, like the Move picker and the
 * removal confirmation.
 *
 * Presentation and form validation only: the author picks a length (only
 * lengths shorter than the parent are listed) and types a name. It emits
 * `confirm` with the request or `cancel`; the tree calls the edit service and
 * reports the result back through {@link saving}, {@link nameError} and
 * {@link errorMessage}.
 */
@Component({
    selector: "clark-hierarchy-add-child",
    templateUrl: "./hierarchy-add-child.component.html",
    styleUrls: ["./hierarchy-add-child.component.scss"],
    standalone: true,
    imports: [NgIf, NgFor, TitleCasePipe, ReactiveFormsModule, A11yModule],
})
export class HierarchyAddChildComponent implements OnInit {
    /** Name of the parent the child is added to. */
    @Input() parentName = "";
    /** Length of the parent; only shorter lengths are offered. */
    @Input() parentLength: LearningObject.Length = LearningObject.Length.COURSE;
    /** Fallback label when the parent has no name. */
    @Input() unnamedLabel = "Unnamed object";
    /** True while the tree is saving; the form is locked and the button busy. */
    @Input() saving = false;
    /** Problem with the name reported by the API (taken or refused). */
    @Input() nameError = "";
    /** General failure shown above the buttons. */
    @Input() errorMessage = "";

    /** Emitted with the trimmed name and chosen length. */
    @Output() confirm = new EventEmitter<NewChildRequest>();
    /** Emitted on Cancel (the tree also closes on Escape and a backdrop click). */
    @Output() cancel = new EventEmitter<void>();

    readonly form = new FormGroup({
        name: new FormControl<string>("", {
            nonNullable: true,
            validators: [notBlank, allowedCharacters],
        }),
        length: new FormControl<LearningObject.Length | null>(null, {
            validators: [Validators.required],
        }),
    });

    /** Whether Create was pressed at least once, so errors may be shown. */
    submitted = false;

    /** Lengths the author may choose, shortest to longest. */
    lengths: LearningObject.Length[] = [];

    ngOnInit(): void {
        this.lengths = LENGTH_ORDER.filter((length) =>
            isValidChildLength(this.parentLength, length),
        );
        // The longest valid length is the usual choice; the author can change it.
        this.form.controls.length.setValue(
            this.lengths[this.lengths.length - 1] ?? null,
        );
    }

    get displayParentName(): string {
        return this.parentName?.trim() || this.unnamedLabel;
    }

    /** Message for the name field, or "" when it is fine. */
    get nameMessage(): string {
        if (this.nameError) {
            return this.nameError;
        }
        const control = this.form.controls.name;
        if (!this.submitted && !control.dirty) {
            return "";
        }
        if (control.hasError("characters")) {
            return INVALID_NAME_MESSAGE;
        }
        if (this.submitted && control.hasError("blank")) {
            return "Enter a name for the new learning object.";
        }

        return "";
    }

    /** Typing again clears an error the API gave for the previous name. */
    onNameInput(): void {
        this.nameError = "";
        this.errorMessage = "";
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.saving || this.form.invalid) {
            return;
        }
        const { name, length } = this.form.getRawValue();
        this.confirm.emit({ name: name.trim(), length });
    }

    onCancel(): void {
        if (!this.saving) {
            this.cancel.emit();
        }
    }
}
