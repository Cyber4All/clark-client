import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OrganizationService } from 'app/core/organization-module/organization.service';
import { Organization } from 'app/core/organization-module/organization.types';

import { OrganizationMigrateModalComponent } from './organization-migrate-modal.component';

describe('OrganizationMigrateModalComponent', () => {
  let component: OrganizationMigrateModalComponent;
  let fixture: ComponentFixture<OrganizationMigrateModalComponent>;
  let organizationService: ReturnType<typeof jasmine.createSpyObj<OrganizationService>>;

  const buildOrganization = (overrides: Partial<Organization> = {}): Organization => ({
    _id: 'org-1',
    name: 'Towson University',
    normalizedName: 'towson university',
    sector: 'academia',
    levels: ['undergraduate'],
    domains: ['towson.edu'],
    isVerified: true,
    ...overrides,
  });

  beforeEach(async () => {
    organizationService = jasmine.createSpyObj<OrganizationService>('OrganizationService', ['searchOrganizations']);

    await TestBed.configureTestingModule({
      imports: [OrganizationMigrateModalComponent],
      providers: [
        { provide: OrganizationService, useValue: organizationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationMigrateModalComponent);
    component = fixture.componentInstance;
    component.isVisible = true;
    component.sourceOrganization = buildOrganization({ _id: 'source-org', name: 'Source University' });
    component.getUserCount = () => 0;
  });

  it('selects a target organization when a search result is clicked', () => {
    const targetOrganization = buildOrganization({ _id: 'target-org', name: 'Target University' });
    component.searchTerm = 'Target';
    component.searchResults = [targetOrganization];
    component.showDropdown = true;

    fixture.detectChanges();

    const result = fixture.debugElement.query(By.css('.org-item'));
    result.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();

    expect(component.selectedTargetOrganization).toEqual(targetOrganization);
    expect(component.targetOrgId).toBe(targetOrganization._id);
    expect(component.searchTerm).toBe(targetOrganization.name);
    expect(component.showDropdown).toBe(false);
  });
});
