import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Organization, OrganizationLevel, OrganizationSector } from '@entity';

@Component({
    selector: 'clark-organization-form',
    templateUrl: './organization-form.component.html',
    styleUrls: ['./organization-form.component.scss'],
})
export class OrganizationFormComponent {
    @Input() display = false;
    @Input() organization: Organization | null = null;
    @Output() closed = new EventEmitter<void>();
    @Output() save = new EventEmitter<any>();

    editForm = {
        name: '',
        sector: 'academia' as OrganizationSector,
        levels: [] as OrganizationLevel[],
        country: '',
        state: '',
        domains: '',
    };

    sectorOptions: OrganizationSector[] = ['academia', 'government', 'industry', 'other'];
    levelOptions: OrganizationLevel[] = [
        'elementary',
        'middle',
        'high',
        'community_college',
        'undergraduate',
        'graduate',
        'post_graduate',
        'training',
    ];

    ngOnChanges(): void {
        if (this.organization) {
            this.editForm = {
                name: this.organization.name,
                sector: this.organization.sector,
                levels: [...this.organization.levels],
                country: this.organization.country || '',
                state: this.organization.state || '',
                domains: this.organization.domains.join(', '),
            };
        }
    }

    toggleLevel(level: OrganizationLevel): void {
        const index = this.editForm.levels.indexOf(level);
        if (index === -1) {
            this.editForm.levels.push(level);
        } else {
            this.editForm.levels.splice(index, 1);
        }
    }

    onSave(): void {
        this.save.emit(this.editForm);
    }

    onClose(): void {
        this.closed.emit();
    }
}
