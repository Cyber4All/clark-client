import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Organization } from "app/core/organization-module/organization.types";
import { NgIf } from "@angular/common";
import { PopupComponent } from "../../../../shared/modules/popups/popup.component";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";

@Component({
    selector: "clark-organization-delete-modal",
    templateUrl: "./organization-delete-modal.component.html",
    styleUrls: ["./organization-delete-modal.component.scss"],
    standalone: true,
    imports: [NgIf, PopupComponent, MatButton, MatIcon],
})
export class OrganizationDeleteModalComponent {
    @Input() isVisible = false;
    @Input() organization: Organization | null = null;

    @Output() closed = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<void>();

    onClose(): void {
        this.closed.emit();
    }

    onConfirm(): void {
        this.confirm.emit();
    }
}
