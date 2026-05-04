import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatStepper, MatStep, MatStepLabel } from '@angular/material/stepper';
import { Organization } from 'app/core/organization-module/organization.types';
import { NgIf, NgFor, TitleCasePipe } from '@angular/common';
import { PopupComponent } from '../../../../shared/modules/popups/popup.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'clark-organization-migrate-modal',
    templateUrl: './organization-migrate-modal.component.html',
    styleUrls: ['./organization-migrate-modal.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        PopupComponent,
        MatProgressBar,
        MatStepper,
        MatStep,
        MatStepLabel,
        MatFormField,
        MatLabel,
        MatInput,
        FormsModule,
        MatIcon,
        MatPrefix,
        NgFor,
        MatCheckbox,
        MatButton,
        TitleCasePipe,
    ],
})
export class OrganizationMigrateModalComponent implements OnChanges {
    @Input() isVisible = false;
    @Input() sourceOrganization: Organization | null = null;
    @Input() sourceUserCount = 0;
    @Input() availableTargetOrganizations: Organization[] = [];
    @Input() isMigrating = false;
    @Input() getUserCount!: (org: Organization) => number;

    @Output() closed = new EventEmitter<void>();
    @Output() migrate = new EventEmitter<string>();

    @ViewChild('stepper') stepper!: MatStepper;

    targetOrgId = '';
    searchTerm = '';
    filteredOrganizations: Organization[] = [];
    certified = false;

    ngOnChanges(): void {
        if (this.isVisible) {
            this.targetOrgId = '';
            this.searchTerm = '';
            this.certified = false;
            this.filteredOrganizations = this.availableTargetOrganizations;

            // Reset stepper
            setTimeout(() => {
                if (this.stepper) {
                    this.stepper.reset();
                }
            });
        }
    }

    onClose(): void {
        this.closed.emit();
    }

    onMigrate(): void {
        if (this.targetOrgId && this.certified) {
            this.migrate.emit(this.targetOrgId);
        }
    }

    filterOrganizations(): void {
        if (!this.searchTerm.trim()) {
            this.filteredOrganizations = this.availableTargetOrganizations;
            return;
        }
        const searchLower = this.searchTerm.toLowerCase();
        this.filteredOrganizations = this.availableTargetOrganizations.filter((org) =>
            org.name.toLowerCase().includes(searchLower) ||
            org.normalizedName.includes(searchLower) ||
            org.sector.toLowerCase().includes(searchLower)
        );
    }

    selectTargetOrganization(orgId: string): void {
        this.targetOrgId = orgId;
        // Auto-advance to confirmation step
        setTimeout(() => {
            if (this.stepper) {
                this.stepper.next();
            }
        }, 100);
    }

    getSelectedTargetOrganization(): Organization | undefined {
        return this.availableTargetOrganizations.find((org) => org._id === this.targetOrgId);
    }
}
