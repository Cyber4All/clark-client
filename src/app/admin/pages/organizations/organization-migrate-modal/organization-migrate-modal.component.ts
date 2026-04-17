import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { OrganizationService } from 'app/core/organization-module/organization.service';
import { Organization, ORGANIZATION_VERIFICATION_STATUS } from 'app/core/organization-module/organization.types';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'clark-organization-migrate-modal',
    templateUrl: './organization-migrate-modal.component.html',
    styleUrls: ['./organization-migrate-modal.component.scss'],
})
export class OrganizationMigrateModalComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isVisible = false;
    @Input() sourceOrganization: Organization | null = null;
    @Input() sourceUserCount = 0;
    @Input() sourceLearningObjectCount = 0;
    @Input() availableTargetOrganizations: Organization[] = [];
    @Input() isMigrating = false;
    @Input() getUserCount!: (org: Organization) => number;
    @Input() loadUserCount?: (org: Organization) => Promise<number>;
    @Input() loadLearningObjectCount?: (org: Organization) => Promise<number>;

    @Output() closed = new EventEmitter<void>();
    @Output() migrate = new EventEmitter<string>();

    targetOrgId = '';
    searchTerm = '';
    searchResults: Organization[] = [];
    selectedTargetOrganization: Organization | null = null;
    certified = false;
    showDropdown = false;
    searchLoading = false;
    searchError = '';
    userCountCache = new Map<string, number>();
    learningObjectCountCache = new Map<string, number>();
    loadingUserCountIds = new Set<string>();
    loadingLearningObjectCountIds = new Set<string>();

    private readonly searchInput$ = new Subject<string>();
    private readonly destroyed$ = new Subject<void>();

    constructor(private readonly organizationService: OrganizationService) {}

    ngOnInit(): void {
        this.searchInput$
            .pipe(
                debounceTime(250),
                distinctUntilChanged(),
                switchMap((term) => {
                    const trimmedTerm = term.trim();

                    if (!trimmedTerm) {
                        this.searchLoading = false;
                        this.searchError = '';
                        this.searchResults = [];
                        this.showDropdown = false;
                        return of<Organization[]>([]);
                    }

                    this.searchLoading = true;
                    this.searchError = '';
                    this.showDropdown = true;

                    return this.organizationService
                        .searchOrganizations({
                            text: trimmedTerm,
                            status: ORGANIZATION_VERIFICATION_STATUS.VERIFIED,
                            limit: 25,
                        })
                        .pipe(
                            map((organizations) =>
                                organizations.filter((organization) =>
                                    organization._id !== this.sourceOrganization?._id && organization.isVerified
                                )
                            ),
                            catchError((error) => {
                                console.error('Failed to search target organizations for migration', error);
                                this.searchError = 'Failed to search organizations.';
                                return of<Organization[]>([]);
                            })
                        );
                }),
                takeUntil(this.destroyed$)
            )
            .subscribe((organizations) => {
                this.searchResults = organizations;
                this.searchLoading = false;
                this.ensureUserCounts(organizations);
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes.isVisible?.currentValue && !changes.isVisible?.previousValue;
        const sourceChangedWhileOpen =
            this.isVisible &&
            !!changes.sourceOrganization &&
            changes.sourceOrganization.currentValue?._id !== changes.sourceOrganization.previousValue?._id;

        if (opened || sourceChangedWhileOpen) {
            this.targetOrgId = '';
            this.searchTerm = '';
            this.certified = false;
            this.searchResults = [];
            this.selectedTargetOrganization = null;
            this.showDropdown = false;
            this.searchLoading = false;
            this.searchError = '';
            this.userCountCache.clear();
            this.learningObjectCountCache.clear();
            this.loadingUserCountIds.clear();
            this.loadingLearningObjectCountIds.clear();
            return;
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

    onSearchInput(term: string): void {
        this.searchTerm = term;
        this.searchInput$.next(term);
    }

    selectTargetOrganization(organization: Organization): void {
        this.selectedTargetOrganization = organization;
        this.targetOrgId = organization._id;
        this.searchTerm = organization.name;
        this.showDropdown = false;
    }

    goBackToSelection(): void {
        if (!this.isMigrating && this.selectedTargetOrganization) {
            this.selectedTargetOrganization = null;
            this.targetOrgId = '';
            this.certified = false;
        }
    }

    getSelectedTargetOrganization(): Organization | undefined {
        return this.selectedTargetOrganization
            || this.availableTargetOrganizations.find((org) => org._id === this.targetOrgId);
    }

    getUserCountText(org: Organization): string {
        if (this.userCountCache.has(org._id)) {
            const count = this.userCountCache.get(org._id) || 0;
            return `${count} user${count === 1 ? '' : 's'}`;
        }

        const cachedCount = this.getUserCount(org);
        if (cachedCount > 0) {
            return `${cachedCount} users`;
        }

        if (this.loadingUserCountIds.has(org._id)) {
            return 'Loading users...';
        }

        return 'Loading users...';
    }

    getLearningObjectCountText(org: Organization): string {
        if (this.learningObjectCountCache.has(org._id)) {
            const count = this.learningObjectCountCache.get(org._id) || 0;
            return `${count} learning object${count === 1 ? '' : 's'}`;
        }

        if (this.loadingLearningObjectCountIds.has(org._id)) {
            return 'Loading learning objects...';
        }

        return 'Loading learning objects...';
    }

    getSourceLearningObjectText(): string {
        const count = this.sourceLearningObjectCount || 0;
        return `${count} learning object${count === 1 ? '' : 's'}`;
    }

    private ensureUserCounts(organizations: Organization[]): void {
        if (!this.loadUserCount) {
            return;
        }

        organizations.forEach((organization) => {
            if (this.userCountCache.has(organization._id) || this.loadingUserCountIds.has(organization._id)) {
                return;
            }

            this.loadingUserCountIds.add(organization._id);
            this.loadUserCount!(organization)
                .then((count) => {
                    this.userCountCache.set(organization._id, count);
                })
                .catch((error) => {
                    console.error('Failed to load user count for migration search result', organization._id, error);
                    this.userCountCache.set(organization._id, 0);
                })
                .finally(() => {
                    this.loadingUserCountIds.delete(organization._id);
                });
        });

        this.ensureLearningObjectCounts(organizations);
    }

    private ensureLearningObjectCounts(organizations: Organization[]): void {
        if (!this.loadLearningObjectCount) {
            return;
        }

        organizations.forEach((organization) => {
            if (this.learningObjectCountCache.has(organization._id) || this.loadingLearningObjectCountIds.has(organization._id)) {
                return;
            }

            this.loadingLearningObjectCountIds.add(organization._id);
            this.loadLearningObjectCount!(organization)
                .then((count) => {
                    this.learningObjectCountCache.set(organization._id, count);
                })
                .catch((error) => {
                    console.error(
                        'Failed to load learning object count for migration search result',
                        organization._id,
                        error
                    );
                    this.learningObjectCountCache.set(organization._id, 0);
                })
                .finally(() => {
                    this.loadingLearningObjectCountIds.delete(organization._id);
                });
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
