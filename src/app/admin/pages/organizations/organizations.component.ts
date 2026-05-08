import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { OrganizationService } from 'app/core/organization-module/organization.service';
import {
  Organization,
  ORGANIZATION_LEVELS,
  ORGANIZATION_SECTORS,
  ORGANIZATION_VERIFICATION_STATUS,
  OrganizationLevel,
  OrganizationSector,
  SearchOrganizationsResponse,
} from 'app/core/organization-module/organization.types';
import { UserService } from 'app/core/user-module/user.service';
import { DropdownFilterOption } from 'app/shared/components/dropdown-filter/dropdown-filter.component';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { debounceTime, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { OrganizationFormData } from './organization-edit-modal/organization-edit-modal.component';

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

  dataSource!: MatTableDataSource<Organization>;
  displayedColumns: string[] = ['verified', 'name', 'users', 'learningObjects', 'sector', 'levels', 'actions'];
  isMobileTableView = false;
  isPhoneTableView = false;
  searchBarPlaceholder = 'Organizations';
  searchValue = '';
  private readonly organizationsPageSize = 1000;

  // Maps for per-organization totals loaded from users and learning-objects search APIs.
  private readonly userCountMap: Map<string, number> = new Map();
  private readonly learningObjectCountMap: Map<string, number> = new Map();
  // Monotonic request version to ignore stale async count responses from prior loads.
  private countsLoadVersion = 0;
  private tableControlsBound = false;

  // Filter options
  selectedVerifiedFilters: Array<'verified' | 'unverified'> = [];
  selectedSectorFilters: OrganizationSector[] = [];
  selectedLevelFilters: OrganizationLevel[] = [];

  displayEditModal = false;
  displayDeleteModal = false;
  displayMigrateModal = false;
  isCreateMode = false;
  selectedOrganization: Organization | null = null;
  isMigrating = false;

  loading = false;
  filteredVerifiedCount = 0;
  filteredUnverifiedCount = 0;
  totalOtherUsers = 0;
  existingNames: string[] = [];
  userSearchInput$: Subject<string> = new Subject();
  componentDestroyed$: Subject<void> = new Subject();
  readonly verifyingOrganizationIds = new Set<string>();
  private otherUsersCountLoadVersion = 0;

  // TODO: Extract as reusable service - AdminFilterService or TableFilterService
  // This multi-filter pattern (search + checkboxes) with custom filter predicates
  // is common across admin pages. Create a service that manages filter state,
  // builds filter objects, and provides filter predicate generators.
  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.displayEditModal = false;
      this.displayDeleteModal = false;
      this.displayMigrateModal = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewportMode();
  }

  readonly verifiedFilterOptions: DropdownFilterOption[] = [
    { label: 'Verified', value: 'verified' },
    { label: 'Unverified', value: 'unverified' },
  ];
  readonly sectorFilterOptions: DropdownFilterOption[] = ORGANIZATION_SECTORS.map((sector) => ({
    label: this.toTitleCase(sector),
    value: sector,
  }));
  readonly levelFilterOptions: DropdownFilterOption[] = ORGANIZATION_LEVELS.map((level) => ({
    label: this.toTitleCase(this.formatLevelName(level)),
    value: level,
  }));
  // TODO(clark-api): Enable organization delete actions when backend delete API is implemented.
  readonly deleteNotSupportedTooltip =
    'Delete is not supported by API. Please reach out to developers.';

  constructor(
    private readonly toaster: ToastrOvenService,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly searchService: SearchService,
  ) { }

  ngOnInit(): void {
    this.updateViewportMode();
    // Initialize dataSource with empty array
    this.dataSource = new MatTableDataSource<Organization>([]);
    this.refreshOverviewCounts();
    this.loadOrganizations();

    // TODO: Extract as reusable utility - TableFilterPredicateBuilder
    // This pattern of building custom filter predicates for MatTableDataSource
    // can be extracted into a utility class or service that generates predicates
    // based on filter configuration objects.
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

    // TODO: Extract as reusable pattern - SearchInputManager or DebouncedSearchService
    // This debounced search pattern is used across many pages. Create a reusable
    // service or helper that manages search input observables with configurable
    // debounce times.
    // Listen for search input
    this.userSearchInput$
      .pipe(takeUntil(this.componentDestroyed$), debounceTime(650))
      .subscribe((searchTerm) => {
        this.searchValue = searchTerm;
        this.applyFilter();
      });
  }

  ngAfterViewInit(): void {
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
    this.bindTableControlsIfReady();
  }

  // TODO: Extract as reusable utility - ResponsiveTableManager or ViewportBreakpointService
  // This pattern of adjusting table columns based on viewport size is common.
  // Create a service that manages breakpoint detection and column visibility
  // configuration for responsive tables.
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
    this.fetchAllOrganizations()
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe({
        next: (organizations) => {
          this.dataSource.data = organizations;
          this.refreshExistingNames();
          this.refreshOverviewCounts();
          this.loadTotalOtherUsers();
          this.bindTableControlsIfReady();
          this.loadVisibleOrganizationCounts();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading organizations:', error);
          this.toaster.error('Error', 'Failed to load organizations.');
          this.loading = false;
          // Fall back to empty array
          this.dataSource.data = [];
          this.refreshExistingNames();
          this.refreshOverviewCounts();
          this.totalOtherUsers = 0;
          this.userCountMap.clear();
          this.learningObjectCountMap.clear();
        }
      });
  }

  private fetchAllOrganizations() {
    const statuses = [
      ORGANIZATION_VERIFICATION_STATUS.VERIFIED,
      ORGANIZATION_VERIFICATION_STATUS.UNVERIFIED,
    ];

    return this.organizationService
      .searchOrganizationsResponse({ page: 1, limit: this.organizationsPageSize, status: statuses })
      .pipe(
        switchMap((firstPage: SearchOrganizationsResponse) => {
          const firstOrganizations = firstPage.organizations || [];
          const limit = firstPage.limit || this.organizationsPageSize;
          const total = firstPage.total ?? firstOrganizations.length;
          const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;

          if (totalPages <= 1) {
            return of(firstOrganizations);
          }

          const pageRequests: Array<ReturnType<OrganizationService['searchOrganizationsResponse']>> = [];
          for (let page = 2; page <= totalPages; page++) {
            pageRequests.push(this.organizationService.searchOrganizationsResponse({ page, limit, status: statuses }));
          }

          return forkJoin(pageRequests).pipe(
            map((responses: SearchOrganizationsResponse[]) => {
              const orgById = new Map<string, Organization>();
              firstOrganizations.forEach((org) => orgById.set(org._id, org));
              responses.forEach((response) => {
                response.organizations.forEach((org) => orgById.set(org._id, org));
              });
              return Array.from(orgById.values());
            })
          );
        })
      );
  }

  /**
   * Apply search filter to table
   * TODO: Extract applyFilter() logic into reusable FilterManager
   * This method pattern is repeated across admin pages. Should be part of
   * a shared filter management service that handles filter state serialization
   * and MatTableDataSource updates.
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
    this.refreshOverviewCounts();
    this.loadVisibleOrganizationCounts();

    // Reset to first page when filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.pageIndex = 0;
    }
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchValue = searchTerm;
    this.applyFilter();
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

  onVerifiedFiltersChange(selectedValues: string[]): void {
    this.selectedVerifiedFilters = selectedValues as Array<'verified' | 'unverified'>;
    this.applyFilter();
  }

  onSectorFiltersChange(selectedValues: string[]): void {
    this.selectedSectorFilters = selectedValues as OrganizationSector[];
    this.applyFilter();
  }

  onLevelFiltersChange(selectedValues: string[]): void {
    this.selectedLevelFilters = selectedValues as OrganizationLevel[];
    this.applyFilter();
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
    this.displayEditModal = true;
  }

  openCreateModal(): void {
    this.isCreateMode = true;
    this.selectedOrganization = null;
    this.displayEditModal = true;
  }

  toggleOrganizationVerification(org: Organization): void {
    if (!org?._id || this.verifyingOrganizationIds.has(org._id)) {
      return;
    }

    const nextVerifiedState = !org.isVerified;
    this.verifyingOrganizationIds.add(org._id);

    this.organizationService.updateOrganization(org._id, { isVerified: nextVerifiedState })
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe({
        next: (response) => {
          const updatedOrganization = response.organization;
          this.dataSource.data = this.dataSource.data.map((existingOrganization) =>
            existingOrganization._id === updatedOrganization._id ? updatedOrganization : existingOrganization
          );

          if (this.selectedOrganization?._id === updatedOrganization._id) {
            this.selectedOrganization = { ...updatedOrganization };
          }

          this.refreshOverviewCounts();
          this.loadVisibleOrganizationCounts();
          this.toaster.success(
            'Success!',
            `Organization ${updatedOrganization.isVerified ? 'verified' : 'marked unverified'} successfully.`
          );
          this.organizationService.clearCache();
          this.verifyingOrganizationIds.delete(org._id);
        },
        error: (error) => {
          console.error('Error updating organization verification:', error);
          this.toaster.error('Error', 'Failed to update organization verification.');
          this.verifyingOrganizationIds.delete(org._id);
        }
      });
  }

  isVerificationTogglePending(org: Organization): boolean {
    return this.verifyingOrganizationIds.has(org._id);
  }

  /**
   * Close edit modal
   */
  closeEditModal(): void {
    this.displayEditModal = false;
    this.selectedOrganization = null;
    this.isCreateMode = false;
  }

  private refreshExistingNames(): void {
    this.existingNames = this.dataSource.data
      .filter((org): org is Organization => !!org && typeof org === 'object')
      .map((org) => {
        const normalizedName = org.normalizedName?.toLowerCase().trim();
        if (normalizedName) {
          return normalizedName;
        }
        return org.name?.toLowerCase().trim() || '';
      })
      .filter((name) => !!name);
  }

  /**
   * Handle save from edit modal
   */
  onSaveOrganization(formData: OrganizationFormData): void {
    if (this.isCreateMode) {
      this.createOrganization(formData);
    } else {
      this.updateOrganization(formData);
    }
  }

  private createOrganization(formData: OrganizationFormData): void {
    this.loading = true;
    // TODO(clark-api): Support `domains` on organization create endpoint and include `formData.domains` here.
    // The create modal currently collects domains, but backend create API does not support persisting them yet.
    this.organizationService.createOrganization({
      name: formData.name,
      sector: formData.sector,
      levels: formData.levels,
      country: formData.country || undefined,
      state: formData.state || undefined,
    })
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe({
        next: (response) => {
          this.dataSource.data = [...this.dataSource.data, response.organization];
          this.userCountMap.set(response.organization._id, 0);
          this.learningObjectCountMap.set(response.organization._id, 0);
          this.refreshExistingNames();
          this.refreshOverviewCounts();
          this.loadTotalOtherUsers();
          this.loadVisibleOrganizationCounts();
          this.toaster.success('Success!', 'Organization created successfully.');
          this.loading = false;
          this.closeEditModal();
          this.organizationService.clearCache();
        },
        error: (error) => {
          console.error('Error creating organization:', error);
          this.toaster.error('Error', 'Failed to create organization.');
          this.loading = false;
        }
      });
  }

  private updateOrganization(formData: OrganizationFormData): void {
    if (!this.selectedOrganization) {
      return;
    }

    this.loading = true;
    this.organizationService.updateOrganization(this.selectedOrganization._id, {
      name: formData.name,
      sector: formData.sector,
      levels: formData.levels,
      country: formData.country || undefined,
      state: formData.state || undefined,
      domains: formData.domains,
    })
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe({
        next: (response) => {
          const index = this.dataSource.data.findIndex(
            (org) => org._id === response.organization._id
          );
          if (index !== -1) {
            const updatedData = [...this.dataSource.data];
            updatedData[index] = response.organization;
            this.dataSource.data = updatedData;
            this.refreshExistingNames();
            this.refreshOverviewCounts();
            this.loadTotalOtherUsers();
            this.loadVisibleOrganizationCounts();
          }
          this.toaster.success('Success!', 'Organization updated successfully.');
          this.loading = false;
          this.closeEditModal();
          this.organizationService.clearCache();
        },
        error: (error) => {
          console.error('Error updating organization:', error);
          this.toaster.error('Error', 'Failed to update organization.');
          this.loading = false;
        }
      });
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
    this.userCountMap.delete(selectedOrgId);
    this.learningObjectCountMap.delete(selectedOrgId);
    this.refreshExistingNames();
    this.refreshOverviewCounts();
    this.loadTotalOtherUsers();
    this.loadVisibleOrganizationCounts();

    this.toaster.success('Success!', 'Organization deleted successfully.');
    this.closeDeleteModal();
  }

  /**
   * Get user count for organization from API-provided count fields (if present)
   */
  getUserCount(org: Organization): number {
    return this.userCountMap.get(org._id) || 0;
  }

  getLearningObjectCount(org: Organization): number {
    return this.learningObjectCountMap.get(org._id) || 0;
  }

  async loadUserCountForMigration(org: Organization): Promise<number> {
    const cachedCount = this.userCountMap.get(org._id);
    if (cachedCount !== undefined) {
      return cachedCount;
    }

    const count = await this.fetchUserCount(org._id);
    this.userCountMap.set(org._id, count);
    return count;
  }

  async loadLearningObjectCountForMigration(org: Organization): Promise<number> {
    const cachedCount = this.learningObjectCountMap.get(org._id);
    if (cachedCount !== undefined) {
      return cachedCount;
    }

    const count = await this.fetchLearningObjectCount(org._id);
    this.learningObjectCountMap.set(org._id, count);
    return count;
  }

  getTotalOtherUsers(): number {
    return this.totalOtherUsers;
  }

  private refreshOverviewCounts(): void {
    const organizations = this.dataSource.filteredData;
    let verified = 0;
    for (const org of organizations) {
      if (org.isVerified) {
        verified++;
      }
    }
    this.filteredVerifiedCount = verified;
    this.filteredUnverifiedCount = organizations.length - verified;
  }

  /**
   * Format level name for display (replace underscores with spaces)
   */
  formatLevelName(level: string): string {
    // eslint-disable-next-line prefer-regex-literals
    return level.replace(/_/g, ' ');
  }

  private toTitleCase(value: string): string {
    return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private async loadTotalOtherUsers(): Promise<void> {
    const currentVersion = ++this.otherUsersCountLoadVersion;

    try {
      const organizations = await this.organizationService.searchOrganizations({ text: 'Other' }).toPromise();
      const otherOrganization = organizations.find(
        (org) => (org.normalizedName || '').trim().toLowerCase() === 'other'
      );

      if (!otherOrganization?._id) {
        if (currentVersion !== this.otherUsersCountLoadVersion) {
          return;
        }
        this.totalOtherUsers = 0;
        return;
      }

      const response = await this.userService.searchUsersResponse({
        organizationId: [otherOrganization._id],
        page: 1,
        limit: 1,
      });
      if (currentVersion !== this.otherUsersCountLoadVersion) {
        return;
      }
      this.totalOtherUsers = response.total || 0;
    } catch (error) {
      if (currentVersion !== this.otherUsersCountLoadVersion) {
        return;
      }
      console.error('Failed to fetch total users in other-sector organizations', error);
      this.totalOtherUsers = 0;
    }
  }

  private async loadVisibleOrganizationCounts(): Promise<void> {
    const visibleOrganizations = this.getVisibleOrganizations();
    const visibleOrganizationIds = visibleOrganizations.map((org) => org._id);
    const missingUserCountIds = visibleOrganizationIds.filter(
      (organizationId) => !this.userCountMap.has(organizationId)
    );
    const missingLearningObjectCountIds = visibleOrganizationIds.filter(
      (organizationId) => !this.learningObjectCountMap.has(organizationId)
    );

    if (missingUserCountIds.length === 0 && missingLearningObjectCountIds.length === 0) {
      return;
    }

    // Capture a version for this run; any newer run increments the shared value.
    const currentVersion = ++this.countsLoadVersion;

    if (missingUserCountIds.length > 0) {
      const userCountPairs = await this.fetchCountPairs(
        missingUserCountIds,
        (organizationId) => this.fetchUserCount(organizationId)
      );
      // If data reloaded while we were awaiting, discard stale results.
      if (currentVersion !== this.countsLoadVersion) {
        return;
      }
      userCountPairs.forEach(([organizationId, count]) => this.userCountMap.set(organizationId, count));
    }

    if (missingLearningObjectCountIds.length > 0) {
      const learningObjectCountPairs = await this.fetchCountPairs(
        missingLearningObjectCountIds,
        (organizationId) => this.fetchLearningObjectCount(organizationId)
      );
      // Same stale-result guard for the second async phase.
      if (currentVersion !== this.countsLoadVersion) {
        return;
      }
      learningObjectCountPairs.forEach(([organizationId, count]) => {
        this.learningObjectCountMap.set(organizationId, count);
      });
    }

    this.refreshOverviewCounts();
  }

  private getVisibleOrganizations(): Organization[] {
    let renderedData = this.dataSource.filteredData.slice();
    if (this.sort && this.sort.active && this.sort.direction) {
      renderedData = this.dataSource.sortData(renderedData, this.sort);
    }

    if (!this.paginator) {
      return renderedData;
    }

    const pageSize = this.paginator.pageSize || renderedData.length;
    const pageIndex = this.paginator.pageIndex || 0;
    const startIndex = pageIndex * pageSize;
    return renderedData.slice(startIndex, startIndex + pageSize);
  }

  private bindTableControlsIfReady(): void {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.tableControlsBound || !this.sort || !this.paginator) {
      return;
    }

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(takeUntil(this.componentDestroyed$))
      .subscribe(() => {
        this.loadVisibleOrganizationCounts();
      });
    this.tableControlsBound = true;
  }

  private async fetchCountPairs(
    organizationIds: string[],
    fetcher: (organizationId: string) => Promise<number>,
    chunkSize = 8
  ): Promise<Array<[string, number]>> {
    const pairs: Array<[string, number]> = [];
    for (let i = 0; i < organizationIds.length; i += chunkSize) {
      const chunk = organizationIds.slice(i, i + chunkSize);
      const chunkCounts = await Promise.all(
        chunk.map(async (organizationId) => [organizationId, await fetcher(organizationId)] as [string, number])
      );
      pairs.push(...chunkCounts);
    }
    return pairs;
  }

  private async fetchUserCount(organizationId: string): Promise<number> {
    try {
      const response = await this.userService.searchUsersResponse({
        organizationId: [organizationId],
        page: 1,
        limit: 1,
      });
      return response.total || 0;
    } catch (error) {
      console.error('Failed to fetch user count for organization', organizationId, error);
      return 0;
    }
  }

  private async fetchLearningObjectCount(organizationId: string): Promise<number> {
    try {
      const response = await this.searchService.getLearningObjects({
        organizationId: [organizationId],
        currPage: 1,
        limit: 1,
      });
      return response.total || 0;
    } catch (error) {
      console.error('Failed to fetch learning object count for organization', organizationId, error);
      return 0;
    }
  }

  /**
   * Open migrate users modal
   */
  openMigrateModal(org: Organization): void {
    this.selectedOrganization = org;
    this.displayMigrateModal = true;
  }

  /**
   * Close migrate modal
   */
  closeMigrateModal(): void {
    this.displayMigrateModal = false;
    this.selectedOrganization = null;
  }

  /**
   * Get available organizations for migration
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
   * Handle migration confirmation
   */
  onMigrateUsers(targetOrgId: string): void {
    if (!this.selectedOrganization) {
      return;
    }

    const sourceOrg = this.selectedOrganization;
    const targetOrg = this.dataSource.data.find((org) => org._id === targetOrgId);

    if (!targetOrg) {
      this.toaster.error('Error', 'Target organization not found.');
      return;
    }

    this.isMigrating = true;
    this.organizationService
      .migrateOrganizationUsers(sourceOrg._id, { organizationId: targetOrgId })
      .pipe(
        takeUntil(this.componentDestroyed$),
        finalize(() => {
          this.isMigrating = false;
        })
      )
      .subscribe({
        next: () => {
          this.organizationService.clearCache();
          this.userCountMap.clear();
          this.learningObjectCountMap.clear();
          this.loadOrganizations();
          this.toaster.success(
            'Success!',
            `Migrated users from ${sourceOrg.name} to ${targetOrg.name}.`
          );
          this.closeMigrateModal();
        },
        error: (error: unknown) => {
          console.error('Error migrating organization users:', error);
          this.toaster.error('Migration failed', this.getMigrationErrorMessage(error));
        }
      });
  }

  private getMigrationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendError = error.error;

      if (typeof backendError === 'string' && backendError.trim()) {
        return backendError;
      }

      if (backendError && typeof backendError === 'object') {
        const message = (backendError as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }

      if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'There was an error migrating users. Please try again later.';
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.unsubscribe();
  }
}
