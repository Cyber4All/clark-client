import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { OrganizationService } from 'app/core/organization-module/organization.service';
import { Organization } from 'app/core/organization-module/organization.types';
import { UserService } from 'app/core/user-module/user.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { of, throwError } from 'rxjs';
import { OrganizationsComponent } from './organizations.component';

describe('OrganizationsComponent', () => {
  let component: OrganizationsComponent;
  let toaster: ReturnType<typeof jasmine.createSpyObj<ToastrOvenService>>;
  let organizationService: ReturnType<typeof jasmine.createSpyObj<OrganizationService>>;
  let userService: ReturnType<typeof jasmine.createSpyObj<UserService>>;
  let searchService: ReturnType<typeof jasmine.createSpyObj<SearchService>>;

  const buildOrganization = (
    overrides: Partial<Organization> = {},
  ): Organization => ({
    _id: 'org-1',
    name: 'Towson University',
    normalizedName: 'towson university',
    sector: 'academia',
    levels: ['undergraduate'],
    domains: ['towson.edu'],
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    toaster = jasmine.createSpyObj<ToastrOvenService>('ToastrOvenService', ['success', 'error']);
    organizationService = jasmine.createSpyObj<OrganizationService>(
      'OrganizationService',
      ['clearCache', 'migrateOrganizationUsers', 'searchOrganizations', 'searchOrganizationsResponse']
    );
    userService = jasmine.createSpyObj<UserService>('UserService', ['searchUsersResponse']);
    searchService = jasmine.createSpyObj<SearchService>('SearchService', ['getLearningObjects']);

    component = new OrganizationsComponent(toaster, organizationService, userService, searchService);
    component.dataSource = new MatTableDataSource<Organization>([]);
  });

  it('returns verified target organizations excluding the selected source org', () => {
    const sourceOrganization = buildOrganization({ _id: 'source-org', name: 'Source University' });
    const verifiedTarget = buildOrganization({ _id: 'verified-target', name: 'Verified Target' });
    const unverifiedTarget = buildOrganization({
      _id: 'unverified-target',
      name: 'Unverified Target',
      isVerified: false,
    });

    component.selectedOrganization = sourceOrganization;
    component.dataSource.data = [unverifiedTarget, verifiedTarget, sourceOrganization];

    expect(component.getAvailableTargetOrganizations()).toEqual([verifiedTarget]);
  });

  it('migrates users, clears cached counts, and refreshes organizations on success', () => {
    const sourceOrganization = buildOrganization({ _id: 'source-org', name: 'Source University' });
    const targetOrganization = buildOrganization({ _id: 'target-org', name: 'Target University' });
    const loadOrganizationsSpy = spyOn<any>(component, 'loadOrganizations');

    component.selectedOrganization = sourceOrganization;
    component.displayMigrateModal = true;
    component.dataSource.data = [sourceOrganization, targetOrganization];
    (component as any).userCountMap.set(sourceOrganization._id, 11);
    (organizationService.migrateOrganizationUsers as any).and.returnValue(of(undefined));

    component.onMigrateUsers(targetOrganization._id);

    expect(organizationService.migrateOrganizationUsers).toHaveBeenCalledWith(sourceOrganization._id, {
      organizationId: targetOrganization._id,
    });
    expect(organizationService.clearCache).toHaveBeenCalled();
    expect(loadOrganizationsSpy).toHaveBeenCalled();
    expect(component.getUserCount(sourceOrganization)).toBe(0);
    expect(toaster.success).toHaveBeenCalledWith(
      'Success!',
      'Migrated users from Source University to Target University.'
    );
    expect(component.displayMigrateModal).toBe(false);
    expect(component.selectedOrganization).toBeNull();
    expect(component.isMigrating).toBe(false);
  });

  it('shows a specific backend error message when migration fails', () => {
    const sourceOrganization = buildOrganization({ _id: 'source-org', name: 'Source University' });
    const targetOrganization = buildOrganization({ _id: 'target-org', name: 'Target University' });
    const loadOrganizationsSpy = spyOn<any>(component, 'loadOrganizations');

    component.selectedOrganization = sourceOrganization;
    component.displayMigrateModal = true;
    component.dataSource.data = [sourceOrganization, targetOrganization];
    (organizationService.migrateOrganizationUsers as any).and.returnValue(
      throwError(() => new HttpErrorResponse({
        status: 400,
        error: { message: 'Target organization must be verified.' },
      }))
    );

    component.onMigrateUsers(targetOrganization._id);

    expect(toaster.error).toHaveBeenCalledWith(
      'Migration failed',
      'Target organization must be verified.'
    );
    expect(loadOrganizationsSpy).not.toHaveBeenCalled();
    expect(component.displayMigrateModal).toBe(true);
    expect(component.selectedOrganization).toEqual(sourceOrganization);
    expect(component.isMigrating).toBe(false);
  });

  it('does not call the migration API when the selected target is missing', () => {
    const sourceOrganization = buildOrganization({ _id: 'source-org', name: 'Source University' });

    component.selectedOrganization = sourceOrganization;
    component.dataSource.data = [sourceOrganization];

    component.onMigrateUsers('missing-target-org');

    expect(organizationService.migrateOrganizationUsers).not.toHaveBeenCalled();
    expect(toaster.error).toHaveBeenCalledWith('Error', 'Target organization not found.');
    expect(component.isMigrating).toBe(false);
  });
});
