import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Organization } from 'app/core/organization-module/organization.types';

@Component({
  selector: 'clark-organization-migrate-modal',
  templateUrl: './organization-migrate-modal.component.html',
  styleUrls: ['./organization-migrate-modal.component.scss'],
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
