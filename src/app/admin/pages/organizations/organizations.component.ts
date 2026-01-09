import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { Organization, OrganizationLevel, OrganizationSector } from '@entity';
import { AuthService } from 'app/core/auth-module/auth.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
})
export class OrganizationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('list') listElement: ElementRef<HTMLElement>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('stepper') stepper: MatStepper;

  organizations: Organization[] = [];
  dataSource: MatTableDataSource<Organization>;
  displayedColumns: string[] = ['verified', 'name', 'users', 'sector', 'levels', 'actions'];
  searchBarPlaceholder = 'Organizations';
  searchValue = '';

  // Map to store consistent user counts for each organization
  private userCountMap: Map<string, number> = new Map();

  // Filter options
  verifiedFilter: 'all' | 'verified' | 'unverified' = 'all';
  sectorFilter: OrganizationSector | 'all' = 'all';
  levelFilter: OrganizationLevel | 'all' = 'all';

  displayEditModal = false;
  displayDeleteModal = false;
  displayMigrateModal = false;
  displayMigrateConfirmModal = false;
  selectedOrganization: Organization | null = null;
  migrateTargetOrgId = '';
  migrateSearchTerm = '';
  filteredTargetOrganizations: Organization[] = [];
  isMigrating = false;
  migrateCertified = false;

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

  // Modal form fields
  editForm = {
    name: '',
    sector: 'academia' as OrganizationSector,
    levels: [] as OrganizationLevel[],
    country: '',
    state: '',
    domains: '', // comma-separated
  };

  constructor(
    private toaster: ToastrOvenService,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.initializeMockData();
    this.dataSource = new MatTableDataSource(this.organizations);

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
      const matchesVerified =
        filterObj.verified === 'all' ||
        (filterObj.verified === 'verified' && data.isVerified) ||
        (filterObj.verified === 'unverified' && !data.isVerified);

      // Sector filter
      const matchesSector =
        filterObj.sector === 'all' || data.sector === filterObj.sector;

      // Level filter
      const matchesLevel =
        filterObj.level === 'all' || data.levels.includes(filterObj.level);

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

  /**
   * Initialize with mock organizations data
   */
  private initializeMockData(): void {
    this.organizations = [
      {
        _id: '1',
        name: 'MIT',
        normalizedName: 'mit',
        sector: 'academia',
        levels: ['undergraduate', 'graduate'],
        country: 'United States',
        state: 'MA',
        domains: ['mit.edu'],
        isVerified: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        _id: '2',
        name: 'Stanford University',
        normalizedName: 'stanford university',
        sector: 'academia',
        levels: ['undergraduate', 'graduate', 'post_graduate'],
        country: 'United States',
        state: 'CA',
        domains: ['stanford.edu'],
        isVerified: true,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        _id: '3',
        name: 'Harvard University',
        normalizedName: 'harvard university',
        sector: 'academia',
        levels: ['undergraduate', 'graduate'],
        country: 'United States',
        state: 'MA',
        domains: ['harvard.edu', 'mail.harvard.edu'],
        isVerified: true,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
      {
        _id: '4',
        name: 'National Security Agency',
        normalizedName: 'national security agency',
        sector: 'government',
        levels: ['training'],
        country: 'United States',
        state: 'MD',
        domains: ['nsa.gov'],
        isVerified: true,
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
      },
      {
        _id: '5',
        name: 'Department of Defense',
        normalizedName: 'department of defense',
        sector: 'government',
        levels: ['training'],
        country: 'United States',
        state: 'DC',
        domains: ['defense.gov', 'mil'],
        isVerified: true,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
      },
      {
        _id: '6',
        name: 'Google',
        normalizedName: 'google',
        sector: 'industry',
        levels: ['training'],
        country: 'United States',
        state: 'CA',
        domains: ['google.com', 'googlemail.com'],
        isVerified: true,
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-06'),
      },
      {
        _id: '7',
        name: 'Microsoft',
        normalizedName: 'microsoft',
        sector: 'industry',
        levels: ['training'],
        country: 'United States',
        state: 'WA',
        domains: ['microsoft.com'],
        isVerified: true,
        createdAt: new Date('2024-01-07'),
        updatedAt: new Date('2024-01-07'),
      },
      {
        _id: '8',
        name: 'Apple Inc',
        normalizedName: 'apple inc',
        sector: 'industry',
        levels: ['training'],
        country: 'United States',
        state: 'CA',
        domains: ['apple.com'],
        isVerified: false,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
      },
      {
        _id: '8a',
        name: 'University of California System',
        normalizedName: 'university of california system',
        sector: 'academia',
        levels: ['undergraduate', 'graduate', 'post_graduate', 'training'],
        country: 'United States',
        state: 'CA',
        domains: ['universityofcalifornia.edu'],
        isVerified: true,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
      },
      {
        _id: '9',
        name: 'UC Berkeley',
        normalizedName: 'uc berkeley',
        sector: 'academia',
        levels: ['undergraduate', 'graduate'],
        country: 'United States',
        state: 'CA',
        domains: ['berkeley.edu'],
        isVerified: true,
        createdAt: new Date('2024-01-09'),
        updatedAt: new Date('2024-01-09'),
      },
      {
        _id: '10',
        name: 'Carnegie Mellon University',
        normalizedName: 'carnegie mellon university',
        sector: 'academia',
        levels: ['undergraduate', 'graduate'],
        country: 'United States',
        state: 'PA',
        domains: ['cmu.edu'],
        isVerified: true,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        _id: '11',
        name: 'Princeton University',
        normalizedName: 'princeton university',
        sector: 'academia',
        levels: ['undergraduate', 'graduate'],
        country: 'United States',
        state: 'NJ',
        domains: ['princeton.edu'],
        isVerified: true,
        createdAt: new Date('2024-01-11'),
        updatedAt: new Date('2024-01-11'),
      },
      {
        _id: '12',
        name: 'Yale University',
        normalizedName: 'yale university',
        sector: 'academia',
        levels: ['undergraduate', 'graduate'],
        country: 'United States',
        state: 'CT',
        domains: ['yale.edu'],
        isVerified: false,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        _id: '13',
        name: 'Cisco Systems',
        normalizedName: 'cisco systems',
        sector: 'industry',
        levels: ['training'],
        country: 'United States',
        state: 'CA',
        domains: ['cisco.com'],
        isVerified: true,
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13'),
      },
      {
        _id: '14',
        name: 'IBM',
        normalizedName: 'ibm',
        sector: 'industry',
        levels: ['training'],
        country: 'United States',
        state: 'NY',
        domains: ['ibm.com'],
        isVerified: true,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
      },
      {
        _id: '15',
        name: 'Cybersecurity and Infrastructure Security Agency',
        normalizedName: 'cybersecurity and infrastructure security agency',
        sector: 'government',
        levels: ['training', 'undergraduate'],
        country: 'United States',
        state: 'DC',
        domains: ['cisa.gov'],
        isVerified: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        _id: '16',
        name: 'UCLA',
        normalizedName: 'ucla',
        sector: 'academia',
        levels: ['undergraduate', 'graduate'],
        country: 'United States',
        state: 'CA',
        domains: ['ucla.edu'],
        isVerified: true,
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        _id: '17',
        name: 'Johns Hopkins University',
        normalizedName: 'johns hopkins university',
        sector: 'academia',
        levels: ['undergraduate', 'graduate', 'post_graduate'],
        country: 'United States',
        state: 'MD',
        domains: ['jhu.edu'],
        isVerified: false,
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
      },
      {
        _id: '18',
        name: 'Community College of San Francisco',
        normalizedName: 'community college of san francisco',
        sector: 'academia',
        levels: ['community_college'],
        country: 'United States',
        state: 'CA',
        domains: ['ccsf.edu'],
        isVerified: true,
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
      },
      {
        _id: '19',
        name: 'CompTIA',
        normalizedName: 'comptia',
        sector: 'industry',
        levels: ['training'],
        country: 'United States',
        state: 'NC',
        domains: ['comptia.org'],
        isVerified: true,
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19'),
      },
      {
        _id: '20',
        name: 'Oxford University',
        normalizedName: 'oxford university',
        sector: 'academia',
        levels: ['undergraduate', 'graduate', 'post_graduate'],
        country: 'United Kingdom',
        state: null,
        domains: ['ox.ac.uk'],
        isVerified: false,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
    ];
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
      verified: this.verifiedFilter,
      sector: this.sectorFilter,
      level: this.levelFilter,
    };
    this.dataSource.filter = JSON.stringify(filterValue);

    // Reset to first page when filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.pageIndex = 0;
    }
  }

  /**
   * Update verified filter
   */
  onVerifiedFilterChange(value: 'all' | 'verified' | 'unverified'): void {
    this.verifiedFilter = value;
    this.applyFilter();
  }

  /**
   * Update sector filter
   */
  onSectorFilterChange(value: OrganizationSector | 'all'): void {
    this.sectorFilter = value;
    this.applyFilter();
  }

  /**
   * Update level filter
   */
  onLevelFilterChange(value: OrganizationLevel | 'all'): void {
    this.levelFilter = value;
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
    this.selectedOrganization = { ...org };
    this.editForm = {
      name: org.name,
      sector: org.sector,
      levels: [...org.levels],
      country: org.country || '',
      state: org.state || '',
      domains: org.domains.join(', '),
    };
    this.displayEditModal = true;
  }

  /**
   * Close edit modal
   */
  closeEditModal(): void {
    this.displayEditModal = false;
    this.selectedOrganization = null;
  }

  /**
   * Save organization changes
   */
  saveOrganization(): void {
    if (!this.selectedOrganization) {
      return;
    }

    const domainsList = this.editForm.domains
      .split(',')
      .map((d: string) => d.trim())
      .filter((d: string) => d.length > 0);

    const updatedOrg: Organization = {
      ...this.selectedOrganization,
      name: this.editForm.name,
      normalizedName: this.editForm.name.toLowerCase().trim(),
      sector: this.editForm.sector,
      levels: this.editForm.levels,
      country: this.editForm.country || undefined,
      state: this.editForm.state || undefined,
      domains: domainsList,
      updatedAt: new Date(),
    };

    // Find and update in the organizations array
    const index = this.organizations.findIndex(
      (org) => org._id === updatedOrg._id
    );
    if (index !== -1) {
      this.organizations[index] = updatedOrg;
      this.dataSource.data = this.organizations;
    }

    this.toaster.success('Success!', 'Organization updated successfully.');
    this.closeEditModal();
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

    this.organizations = this.organizations.filter(
      (org) => org._id !== this.selectedOrganization._id
    );
    this.dataSource.data = this.organizations;

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
    return this.organizations.find((org) => org._id === this.migrateTargetOrgId);
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
    return this.organizations
      .filter((org) => org._id !== this.selectedOrganization._id && org.isVerified)
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
    const targetOrg = this.organizations.find(
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

      // Force table refresh
      this.dataSource.data = [...this.organizations];

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
