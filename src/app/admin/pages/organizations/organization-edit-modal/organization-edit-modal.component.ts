import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import {
    Organization,
    ORGANIZATION_LEVELS,
    ORGANIZATION_SECTORS,
    OrganizationLevel,
    OrganizationSector,
} from 'app/core/organization-module/organization.types';

export interface OrganizationFormData {
    name: string;
    sector: OrganizationSector;
    levels: OrganizationLevel[];
    country: string;
    state: string;
    domains: string[];
}

@Component({
    selector: 'clark-organization-edit-modal',
    templateUrl: './organization-edit-modal.component.html',
    styleUrls: ['./organization-edit-modal.component.scss'],
})
export class OrganizationEditModalComponent implements OnChanges {
    @Input() isVisible = false;
    @Input() isCreateMode = false;
    @Input() organization: Organization | null = null;
    @Input() userCount = 0;
    @Input() existingNames: string[] = [];

    @Output() closed = new EventEmitter<void>();
    @Output() save = new EventEmitter<OrganizationFormData>();

    @ViewChild('editStepper') editStepper!: MatStepper;

    form: OrganizationFormData = {
        name: '',
        sector: 'academia',
        levels: [],
        country: '',
        state: '',
        domains: [],
    };

    newDomain = '';
    certified = false;
    sectorOptions: OrganizationSector[] = [...ORGANIZATION_SECTORS];
    levelOptions: OrganizationLevel[] = [...ORGANIZATION_LEVELS];

    ngOnChanges(): void {
        if (this.isVisible) {
            if (this.isCreateMode) {
                this.form = {
                    name: '',
                    sector: 'academia',
                    levels: [],
                    country: '',
                    state: '',
                    domains: [],
                };
            } else if (this.organization) {
                this.form = {
                    name: this.organization.name,
                    sector: this.organization.sector,
                    levels: [...this.organization.levels],
                    country: this.organization.country || '',
                    state: this.organization.state || '',
                    domains: [...this.organization.domains],
                };
            }
            this.newDomain = '';
            this.certified = false;

            // Reset stepper
            setTimeout(() => {
                if (this.editStepper) {
                    this.editStepper.reset();
                }
            });
        }
    }

    onClose(): void {
        this.closed.emit();
    }

    onSave(): void {
        this.save.emit(this.form);
    }

    addDomain(): void {
        const domain = this.newDomain.trim();
        if (domain && !this.form.domains.includes(domain)) {
            this.form.domains.push(domain);
            this.newDomain = '';
        }
    }

    removeDomain(index: number): void {
        this.form.domains.splice(index, 1);
    }

    isNameDuplicate(): boolean {
        if (!this.form.name || !this.isCreateMode) {
            return false;
        }
        const normalizedName = this.form.name.toLowerCase().trim();
        return this.existingNames.includes(normalizedName);
    }

    formatLevelName(level: string): string {
        // eslint-disable-next-line prefer-regex-literals
        return level.replace(/_/g, ' ');
    }
}
