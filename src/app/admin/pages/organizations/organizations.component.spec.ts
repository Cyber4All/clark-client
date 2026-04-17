import { MatTableDataSource } from '@angular/material/table';
import { of, Subject, throwError } from 'rxjs';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { OrganizationService } from 'app/core/organization-module/organization.service';
import { Organization } from 'app/core/organization-module/organization.types';
import { UserService } from 'app/core/user-module/user.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { OrganizationsComponent } from './organizations.component';

describe('OrganizationsComponent', () => {
  let component: OrganizationsComponent;
  let toasterService: ToastrOvenService;
  let organizationService: OrganizationService;
  let userService: UserService;
  let searchService: SearchService;

  const makeOrganization = (overrides: Partial<Organization> = {}): Organization => ({
    _id: 'org-1',
    name: 'Towson University',
    normalizedName: 'towson university',
    sector: 'academia',
    levels: ['undergraduate'],
    domains: ['towson.edu'],
    isVerified: false,
    ...overrides,
  });

  beforeEach(() => {
    toasterService = jasmine.createSpyObj('ToastrOvenService', [
      'success',
      'error',
      'warning',
    ]) as ToastrOvenService;
    organizationService = jasmine.createSpyObj('OrganizationService', [
      'updateOrganization',
      'clearCache',
    ]) as OrganizationService;
    userService = jasmine.createSpyObj('UserService', ['searchUsersResponse']) as UserService;
    searchService = jasmine.createSpyObj('SearchService', ['getLearningObjects']) as SearchService;

    component = new OrganizationsComponent(
      toasterService,
      organizationService,
      userService,
      searchService,
    );
    component.dataSource = new MatTableDataSource<Organization>([]);
    component.componentDestroyed$ = new Subject<void>();
    spyOn<any>(component, 'loadVisibleOrganizationCounts').and.returnValue(Promise.resolve());
  });

  it('toggles an organization to verified via the patch route and updates the table row', () => {
    const originalOrganization = makeOrganization();
    const updatedOrganization = makeOrganization({ isVerified: true });
    component.dataSource.data = [originalOrganization];
    component.selectedOrganization = { ...originalOrganization };

    (organizationService.updateOrganization as any).and.returnValue(
      of({ organization: updatedOrganization })
    );

    component.toggleOrganizationVerification(originalOrganization);

    expect(organizationService.updateOrganization).toHaveBeenCalledWith('org-1', {
      isVerified: true,
    });
    expect(component.dataSource.data[0].isVerified).toBe(true);
    expect(component.selectedOrganization?.isVerified).toBe(true);
    expect(component.filteredVerifiedCount).toBe(1);
    expect(component.filteredUnverifiedCount).toBe(0);
    expect(organizationService.clearCache).toHaveBeenCalled();
    expect(toasterService.success).toHaveBeenCalledWith(
      'Success!',
      'Organization verified successfully.'
    );
    expect(component.isVerificationTogglePending(updatedOrganization)).toBe(false);
  });

  it('shows an error and clears pending state when verification update fails', () => {
    const organization = makeOrganization({ _id: 'org-2', isVerified: true });
    component.dataSource.data = [organization];

    (organizationService.updateOrganization as any).and.returnValue(
      throwError(() => new Error('patch failed'))
    );

    component.toggleOrganizationVerification(organization);

    expect(organizationService.updateOrganization).toHaveBeenCalledWith('org-2', {
      isVerified: false,
    });
    expect(component.dataSource.data[0].isVerified).toBe(true);
    expect(toasterService.error).toHaveBeenCalledWith(
      'Error',
      'Failed to update organization verification.'
    );
    expect(component.isVerificationTogglePending(organization)).toBe(false);
  });
});
