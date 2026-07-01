import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Organization } from 'app/core/organization-module/organization.types';
import { NgIf } from '@angular/common';
import { PopupComponent } from '../../../../shared/modules/popups/popup.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
    selector: "clark-organization-delete-modal",
    templateUrl: "./organization-delete-modal.component.html",
    styleUrls: ["./organization-delete-modal.component.scss"],
    standalone: true,
    imports: [
        NgIf,
        PopupComponent,
        FormsModule,
        MatButton,
        MatCheckbox,
        MatIcon,
    ],
})
export class OrganizationDeleteModalComponent implements OnChanges {
    @Input() isVisible = false;
    @Input() organization: Organization | null = null;

    @Output() closed = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<void>();

    certified = false;

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes.isVisible?.currentValue && !changes.isVisible?.previousValue;
        const organizationChangedWhileOpen =
            this.isVisible &&
            !!changes.organization &&
            changes.organization.currentValue?._id !== changes.organization.previousValue?._id;

        if (opened || organizationChangedWhileOpen) {
            this.certified = false;
        }
    }

    onClose(): void {
        this.closed.emit();
    }

    onConfirm(): void {
        if (!this.certified) {
            return;
        }

        this.confirm.emit();
    }
}
