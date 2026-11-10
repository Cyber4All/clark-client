import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

export function createPlaylistMetadataForm() {
    return new FormGroup({
        name: new FormControl("", {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.pattern(/\S/),
                Validators.maxLength(100),
            ],
        }),
        description: new FormControl("", {
            nonNullable: true,
            validators: [Validators.maxLength(500)],
        }),
    });
}

@Component({
    selector: "clark-playlist-metadata-form",
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, MatDialogModule],
    templateUrl: "./playlist-metadata-form.component.html",
    styleUrls: ["./playlist-metadata-form.component.scss"],
})
export class PlaylistMetadataFormComponent {
    @Input({ required: true }) form!: ReturnType<
        typeof createPlaylistMetadataForm
    >;
    @Input() editing = false;
    @Input() saving = false;
    @Input() error = "";
    @Output() submitted = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();
}
