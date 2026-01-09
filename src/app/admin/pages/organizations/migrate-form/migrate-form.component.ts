import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Organization } from '@entity';

@Component({
    selector: 'clark-migrate-form',
    templateUrl: './migrate-form.component.html',
    styleUrls: ['./migrate-form.component.scss'],
})
export class MigrateFormComponent {
    @Input() display = false;
    @Input() displayConfirm = false;
    @Input() sourceOrganization: Organization | null = null;
    @Input() targetOrganization: Organization | null = null;
    @Input() filteredOrganizations: Organization[] = [];
    @Input() userCount = 0;
    @Input() targetUserCount = 0;
    @Input() isProcessing = false;
    @Output() closed = new EventEmitter<void>();
    @Output() confirmClosed = new EventEmitter<void>();
    @Output() searchChanged = new EventEmitter<string>();
    @Output() organizationSelected = new EventEmitter<string>();
    @Output() continueClicked = new EventEmitter<void>();
    @Output() migrateConfirmed = new EventEmitter<void>();

    searchTerm = '';
    selectedOrgId = '';

    onSearchChange(): void {
        this.searchChanged.emit(this.searchTerm);
    }

    selectOrganization(orgId: string): void {
        this.selectedOrgId = orgId;
        this.organizationSelected.emit(orgId);
    }

    onContinue(): void {
        this.continueClicked.emit();
    }

    onClose(): void {
        this.searchTerm = '';
        this.selectedOrgId = '';
        this.closed.emit();
    }

    onConfirmClose(): void {
        this.confirmClosed.emit();
    }

    onMigrateConfirm(): void {
        this.migrateConfirmed.emit();
    }
}
