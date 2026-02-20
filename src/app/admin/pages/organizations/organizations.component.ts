import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizationService } from 'app/core/organization-module/organization.service';
import {
  Organization,
  ORGANIZATION_LEVELS,
  ORGANIZATION_SECTORS,
  OrganizationLevel,
  OrganizationSector,
} from 'app/core/organization-module/organization.types';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
})
export class OrganizationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('list') listElement!: ElementRef<HTMLElement>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('editStepper') editStepper!: MatStepper;

  dataSource!: MatTableDataSource<Organization>;
  displayedColumns: string[] = ['verified', 'name', 'users', 'learningObjects', 'sector', 'levels', 'actions'];
  isMobileTableView = false;
  isPhoneTableView = false;
  searchBarPlaceholder = 'Organizations';
  searchValue = '';

  // Map to store consistent user counts for each organization
  private readonly userCountMap: Map<string, number> = new Map();
  private readonly learningObjectCountMap: Map<string, number> = new Map();

  // Filter options
  selectedVerifiedFilters: Array<'verified' | 'unverified'> = [];
  selectedSectorFilters: OrganizationSector[] = [];
  selectedLevelFilters: OrganizationLevel[] = [];

  displayEditModal = false;
  displayDeleteModal = false;
  displayMigrateModal = false;
  isCreateMode = false;
  displayMigrateConfirmModal = false;
  selectedOrganization: Organization | null = null;
  migrateTargetOrgId = '';
  migrateSearchTerm = '';
  filteredTargetOrganizations: Organization[] = [];
  isMigrating = false;
  migrateCertified = false;
  editCertified = false;

  loading = false;
  userSearchInput$: Subject<string> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.displayEditModal = false;
      this.displayDeleteModal = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewportMode();
  }

  sectorOptions: OrganizationSector[] = [...ORGANIZATION_SECTORS];
  levelOptions: OrganizationLevel[] = [...ORGANIZATION_LEVELS];

  // Modal form fields
  editForm = {
    name: '',
    sector: 'academia' as OrganizationSector,
    levels: [] as OrganizationLevel[],
    country: '',
    state: '',
    domains: [] as string[],
  };

  newDomain = '';

  constructor(
    private readonly toaster: ToastrOvenService,
    private readonly organizationService: OrganizationService,
  ) { }

  ngOnInit(): void {
    this.updateViewportMode();
    // Initialize dataSource with empty array
    this.dataSource = new MatTableDataSource<Organization>([]);
    this.loadOrganizations();

    // Custom filter predicate for searching and filtering
    this.dataSource.filterPredicate = (data: Organization, filter: string) => {
      // Parse filter object
      const filterObj = JSON.parse(filter);
      const searchStr = filterObj.search.toLowerCase();

      // Search filter
      const matchesSearch =
        !searchStr ||
        data.name.toLowerCase().includes(searchStr) ||
        data.normalizedName.includes(searchStr) ||
        data.domains.some((d) => d.toLowerCase().includes(searchStr));

      // Verified filter
      const verifiedFilters: Array<'verified' | 'unverified'> = filterObj.verified || [];
      const matchesVerified =
        verifiedFilters.length === 0 ||
        (data.isVerified && verifiedFilters.includes('verified')) ||
        (!data.isVerified && verifiedFilters.includes('unverified'));

      // Sector filter
      const sectorFilters: OrganizationSector[] = filterObj.sector || [];
      const matchesSector = sectorFilters.length === 0 || sectorFilters.includes(data.sector);

      // Level filter
      const levelFilters: OrganizationLevel[] = filterObj.level || [];
      const matchesLevel =
        levelFilters.length === 0 || data.levels.some((level) => levelFilters.includes(level));

      return matchesSearch && matchesVerified && matchesSector && matchesLevel;
    };

    // Listen for search input
    this.userSearchInput$
      .pipe(takeUntil(this.componentDestroyed$), debounceTime(650))
      .subscribe((searchTerm) => {
        this.searchValue = searchTerm;
        this.applyFilter();
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Custom sort accessor for special columns
    this.dataSource.sortingDataAccessor = (data: Organization, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'verified':
          return data.isVerified ? 1 : 0;
        case 'name':
          return data.name.toLowerCase();
        case 'users':
          return this.getUserCount(data);
        default:
          return (data as any)[sortHeaderId];
      }
    };
  }

  updateViewportMode(): void {
    this.isPhoneTableView = window.innerWidth <= 600;
    this.isMobileTableView = window.innerWidth <= 900;
    if (this.isPhoneTableView) {
      this.displayedColumns = ['verified', 'name', 'actions'];
      return;
    }

    this.displayedColumns = this.isMobileTableView
      ? ['verified', 'name', 'users', 'learningObjects', 'sector', 'actions']
      : ['verified', 'name', 'users', 'learningObjects', 'sector', 'levels', 'actions'];
  }

  /**
   * Load organizations from API
   */
  private loadOrganizations(): void {
    this.loading = true;
    this.organizationService.searchOrganizations({})
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe({
        next: (organizations) => {
          this.dataSource.data = organizations;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading organizations:', error);
          this.toaster.error('Error', 'Failed to load organizations.');
          this.loading = false;
          // Fall back to empty array
          this.dataSource.data = [];
        }
      });
  }

  /**
   * Apply search filter to table
   */
  applyFilter(event?: Event): void {
    if (event) {
      const target = event.target as HTMLInputElement;
      this.searchValue = target.value;
    }
    const filterValue = {
      search: this.searchValue.trim().toLowerCase(),
      verified: this.selectedVerifiedFilters,
      sector: this.selectedSectorFilters,
      level: this.selectedLevelFilters,
    };
    this.dataSource.filter = JSON.stringify(filterValue);

    // Reset to first page when filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.pageIndex = 0;
    }
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedVerifiedFilters.length > 0 ||
      this.selectedSectorFilters.length > 0 ||
      this.selectedLevelFilters.length > 0
    );
  }

  clearAllFilters(): void {
    this.selectedVerifiedFilters = [];
    this.selectedSectorFilters = [];
    this.selectedLevelFilters = [];
    this.applyFilter();
  }

  toggleVerifiedFilter(value: 'verified' | 'unverified'): void {
    if (this.selectedVerifiedFilters.includes(value)) {
      this.selectedVerifiedFilters = this.selectedVerifiedFilters.filter((filter) => filter !== value);
    } else {
      this.selectedVerifiedFilters = [...this.selectedVerifiedFilters, value];
    }
    this.applyFilter();
  }

  toggleSectorFilter(value: OrganizationSector): void {
    if (this.selectedSectorFilters.includes(value)) {
      this.selectedSectorFilters = this.selectedSectorFilters.filter((filter) => filter !== value);
    } else {
      this.selectedSectorFilters = [...this.selectedSectorFilters, value];
    }
    this.applyFilter();
  }

  toggleLevelFilter(value: OrganizationLevel): void {
    if (this.selectedLevelFilters.includes(value)) {
      this.selectedLevelFilters = this.selectedLevelFilters.filter((filter) => filter !== value);
    } else {
      this.selectedLevelFilters = [...this.selectedLevelFilters, value];
    }
    this.applyFilter();
  }

  getVerifiedFilterLabel(): string {
    if (this.selectedVerifiedFilters.length === 0) {
      return 'Verified';
    }
    return `Verified (${this.selectedVerifiedFilters.length})`;
  }

  getSectorFilterLabel(): string {
    if (this.selectedSectorFilters.length === 0) {
      return 'Sector';
    }
    return `Sector (${this.selectedSectorFilters.length})`;
  }

  getLevelFilterLabel(): string {
    if (this.selectedLevelFilters.length === 0) {
      return 'Level';
    }
    return `Level (${this.selectedLevelFilters.length})`;
  }

  /**
   * Handle filter query from clark-admin-filter-search component
   */
  handleFilterQuery(filters: any): void {
    // This is for when we integrate with backend filtering
    // For now, we just apply search filter
    this.applyFilter();
  }

  /**
   * Handle search input
   */
  onSearchInput(term: string): void {
    this.userSearchInput$.next(term);
  }

  /**
   * Open edit modal for organization
   */
  openEditModal(org: Organization): void {
    this.isCreateMode = false;
    this.selectedOrganization = { ...org };
    this.editForm = {
      name: org.name,
      sector: org.sector,
      levels: [...org.levels],
      country: org.country || '',
      state: org.state || '',
      domains: [...org.domains],
    };
    this.newDomain = '';
    this.editCertified = false;
    this.displayEditModal = true;

    // Reset stepper to first step
    setTimeout(() => {
      if (this.editStepper) {
        this.editStepper.reset();
      }
    });
  }

  openCreateModal(): void {
    this.isCreateMode = true;
    this.selectedOrganization = null;
    this.editForm = {
      name: '',
      sector: 'academia',
      levels: [],
      country: '',
      state: '',
      domains: [],
    };
    this.newDomain = '';
    this.editCertified = false;
    this.displayEditModal = true;

    // Reset stepper to first step
    setTimeout(() => {
      if (this.editStepper) {
        this.editStepper.reset();
      }
    });
  }

  /**
   * Close edit modal
   */
  closeEditModal(): void {
    this.displayEditModal = false;
    this.selectedOrganization = null;
    this.newDomain = '';
    this.editCertified = false;
    this.isCreateMode = false;
  }

  /**
   * Add domain to the list
   */
  addDomain(): void {
    const domain = this.newDomain.trim();
    if (domain && !this.editForm.domains.includes(domain)) {
      this.editForm.domains.push(domain);
      this.newDomain = '';
    }
  }

  /**
   * Remove domain from the list
   */
  removeDomain(index: number): void {
    this.editForm.domains.splice(index, 1);
  }

  /**
   * Format level name for display (replace underscores with spaces)
   */
  formatLevelName(level: string): string {
    // eslint-disable-next-line prefer-regex-literals
    return level.replace(/_/g, ' ');
  }

  /**
   * Check if organization name already exists
   */
  isNameDuplicate(): boolean {
    if (!this.editForm.name || !this.isCreateMode) {
      return false;
    }
    const normalizedName = this.editForm.name.toLowerCase().trim();
    return this.dataSource.data.some(
      (org) => org.normalizedName === normalizedName
    );
  }

  /**
   * Save organization changes or create new organization
   */
  saveOrganization(): void {
    if (this.isCreateMode) {
      // Validate unique name
      if (!this.editForm.name || this.isNameDuplicate()) {
        this.toaster.error('Error', 'Organization name is required and must be unique.');
        return;
      }

      // Create new organization via API
      this.loading = true;
      this.organizationService.createOrganization({
        name: this.editForm.name,
        sector: this.editForm.sector,
        levels: this.editForm.levels,
        country: this.editForm.country || undefined,
        state: this.editForm.state || undefined,
      })
        .pipe(takeUntil(this.componentDestroyed$))
        .subscribe({
          next: (response) => {
            this.dataSource.data = [...this.dataSource.data, response.organization];
            this.toaster.success('Success!', 'Organization created successfully.');
            this.loading = false;
            this.closeEditModal();
            // Clear cache to ensure fresh data on next search
            this.organizationService.clearCache();
          },
          error: (error) => {
            console.error('Error creating organization:', error);
            this.toaster.error('Error', 'Failed to create organization.');
            this.loading = false;
          }
        });
    } else {
      // Update existing organization via API
      if (!this.selectedOrganization) {
        return;
      }

      this.loading = true;
      this.organizationService.updateOrganization(this.selectedOrganization._id, {
        name: this.editForm.name,
        sector: this.editForm.sector,
        levels: this.editForm.levels,
        country: this.editForm.country || undefined,
        state: this.editForm.state || undefined,
        domains: this.editForm.domains,
      })
        .pipe(takeUntil(this.componentDestroyed$))
        .subscribe({
          next: (response) => {
            // Find and update in the dataSource
            const index = this.dataSource.data.findIndex(
              (org) => org._id === response.organization._id
            );
            if (index !== -1) {
              const updatedData = [...this.dataSource.data];
              updatedData[index] = response.organization;
              this.dataSource.data = updatedData;
            }
            this.toaster.success('Success!', 'Organization updated successfully.');
            this.loading = false;
            this.closeEditModal();
            // Clear cache to ensure fresh data on next search
            this.organizationService.clearCache();
          },
          error: (error) => {
            console.error('Error updating organization:', error);
            this.toaster.error('Error', 'Failed to update organization.');
            this.loading = false;
          }
        });
    }
  }

  /**
   * Open delete confirmation modal
   */
  openDeleteModal(org: Organization): void {
    this.selectedOrganization = org;
    this.displayDeleteModal = true;
  }

  /**
   * Close delete modal
   */
  closeDeleteModal(): void {
    this.displayDeleteModal = false;
    this.selectedOrganization = null;
  }

  /**
   * Confirm and delete organization
   */
  deleteOrganization(): void {
    if (!this.selectedOrganization) {
      return;
    }

    // Check if organization has users
    const userCount = this.getUserCount(this.selectedOrganization);
    if (userCount > 0) {
      this.toaster.error(
        'Cannot Delete',
        `This organization has ${userCount} user(s). Organizations with users cannot be deleted.`
      );
      return;
    }

    const selectedOrgId = this.selectedOrganization._id;
    this.dataSource.data = this.dataSource.data.filter(
      (org) => org._id !== selectedOrgId
    );

    this.toaster.success('Success!', 'Organization deleted successfully.');
    this.closeDeleteModal();
  }

  /**
   * Get user count for organization (mock)
   */
  getUserCount(org: Organization): number {
    // Mock data - in real implementation, this would come from backend
    // Use consistent values from map
    if (!this.userCountMap.has(org._id)) {
      this.userCountMap.set(org._id, Math.floor(Math.random() * 500) + 1);
    }
    return this.userCountMap.get(org._id) || 0;
  }

  getLearningObjectCount(org: Organization): number {
    // Mock data - in real implementation, this would come from backend
    if (!this.learningObjectCountMap.has(org._id)) {
      this.learningObjectCountMap.set(org._id, Math.floor(Math.random() * 1000) + 1);
    }
    return this.learningObjectCountMap.get(org._id) || 0;
  }

  getFilteredOrganizations(): Organization[] {
    if (!this.dataSource) {
      return [];
    }
    return this.dataSource.filteredData;
  }

  getOverviewTotalOrganizations(): number {
    return this.dataSource.data.length;
  }

  getOverviewVerifiedCount(): number {
    return this.dataSource.data.filter((org) => org.isVerified).length;
  }

  getOverviewUnverifiedCount(): number {
    return this.dataSource.data.filter((org) => !org.isVerified).length;
  }

  getOverviewOtherUserTotal(): number {
    return this.dataSource.data
      .filter((organization) => organization.sector === 'other')
      .reduce((total, organization) => total + this.getUserCount(organization), 0);
  }

  getDeleteDisabledTooltip(organization: Organization): string {
    if (this.getUserCount(organization) > 0) {
      return 'Organizations must have 0 users before they can be deleted.';
    }
    return '';
  }

  /**
   * Get visible levels (max 3) and remaining count
   */
  getVisibleLevels(levels: OrganizationLevel[]): OrganizationLevel[] {
    return levels.slice(0, 3);
  }

  /**
   * Get count of remaining levels after the first 3
   */
  getRemainingLevelsCount(levels: OrganizationLevel[]): number {
    return Math.max(0, levels.length - 3);
  }

  /**
   * Open migrate users modal
   */
  openMigrateModal(org: Organization): void {
    this.selectedOrganization = org;
    this.migrateTargetOrgId = '';
    this.migrateSearchTerm = '';
    this.filteredTargetOrganizations = this.getAvailableTargetOrganizations();
    this.displayMigrateModal = true;
  }

  /**
   * Close migrate modal
   */
  closeMigrateModal(): void {
    this.displayMigrateModal = false;
    this.selectedOrganization = null;
    this.migrateTargetOrgId = '';
    this.migrateSearchTerm = '';
    this.filteredTargetOrganizations = [];
    this.migrateCertified = false;
  }

  /**
   * Close migrate confirmation modal
   */
  closeMigrateConfirmModal(): void {
    this.displayMigrateConfirmModal = false;
  }

  /**
   * Filter target organizations based on search term
   */
  filterTargetOrganizations(): void {
    const allOrgs = this.getAvailableTargetOrganizations();
    if (!this.migrateSearchTerm.trim()) {
      this.filteredTargetOrganizations = allOrgs;
      return;
    }
    const searchLower = this.migrateSearchTerm.toLowerCase();
    this.filteredTargetOrganizations = allOrgs.filter((org) =>
      org.name.toLowerCase().includes(searchLower) ||
      org.normalizedName.includes(searchLower) ||
      org.sector.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Handle search term change from migrate form
   */
  onMigrateSearchChange(searchTerm: string): void {
    this.migrateSearchTerm = searchTerm;
    this.filterTargetOrganizations();
  }

  /**
   * Select target organization for migration and advance to confirmation step
   */
  selectTargetOrganization(orgId: string): void {
    this.migrateTargetOrgId = orgId;
    // Auto-advance to confirmation step
    setTimeout(() => {
      if (this.stepper) {
        this.stepper.next();
      }
    }, 100);
  }

  /**
   * Get selected target organization
   */
  getSelectedTargetOrganization(): Organization | undefined {
    return this.dataSource.data.find((org) => org._id === this.migrateTargetOrgId);
  }

  /**
   * Show confirmation step in stepper
   */
  confirmMigration(): void {
    if (!this.migrateTargetOrgId) {
      return;
    }
    // Don't close modal, just proceed to next step in stepper
  }

  /**
   * Get available organizations to migrate users to (excluding current org, only verified)
   */
  getAvailableTargetOrganizations(): Organization[] {
    if (!this.selectedOrganization) {
      return [];
    }
    const selectedOrgId = this.selectedOrganization._id;
    return this.dataSource.data
      .filter((org) => org._id !== selectedOrgId && org.isVerified)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Migrate users from source to target organization
   */
  migrateUsers(): void {
    if (!this.selectedOrganization || !this.migrateTargetOrgId) {
      return;
    }

    this.isMigrating = true;

    const sourceOrg = this.selectedOrganization;
    const targetOrg = this.dataSource.data.find(
      (org) => org._id === this.migrateTargetOrgId
    );

    if (!targetOrg) {
      this.isMigrating = false;
      this.toaster.error('Error', 'Target organization not found.');
      return;
    }

    const userCount = this.getUserCount(sourceOrg);

    // Simulate API call with delay
    setTimeout(() => {
      // Mock implementation: Transfer user count from source to target
      const targetCurrentCount = this.getUserCount(targetOrg);
      this.userCountMap.set(targetOrg._id, targetCurrentCount + userCount);
      this.userCountMap.set(sourceOrg._id, 0);

      // Force table refresh by creating new array reference
      this.dataSource.data = [...this.dataSource.data];

      this.isMigrating = false;
      this.toaster.success(
        'Success!',
        `Migrated ${userCount} user(s) from ${sourceOrg.name} to ${targetOrg.name}.`
      );
      this.migrateCertified = false;
      this.closeMigrateModal();
    }, 1500); // 1.5 second delay to show progress bar
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
