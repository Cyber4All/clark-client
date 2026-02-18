import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizationsComponent } from './organizations.component';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'app/shared/shared.module';

describe('OrganizationsComponent', () => {
  let component: OrganizationsComponent;
  let fixture: ComponentFixture<OrganizationsComponent>;
  let toasterService: jasmine.SpyObj<ToastrOvenService>;

  beforeEach(async () => {
    const toasterSpy = jasmine.createSpyObj('ToastrOvenService', ['success', 'error']);

    await TestBed.configureTestingModule({
      declarations: [OrganizationsComponent],
      imports: [FormsModule, SharedModule],
      providers: [{ provide: ToastrOvenService, useValue: toasterSpy }],
    }).compileComponents();

    toasterService = TestBed.inject(ToastrOvenService) as jasmine.SpyObj<ToastrOvenService>;
    fixture = TestBed.createComponent(OrganizationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with 20 mock organizations', () => {
    expect(component.organizations.length).toBe(20);
  });

  it('should filter organizations by name', () => {
    component.onSearchInput('MIT');
    expect(component.filteredOrganizations.length).toBeGreaterThan(0);
    expect(component.filteredOrganizations[0].name).toContain('MIT');
  });

  it('should filter by verified status', () => {
    component.verifiedFilter = true;
    component.applyFiltersAndSearch();
    expect(component.filteredOrganizations.every((org) => org.isVerified)).toBe(true);
  });

  it('should filter by sector', () => {
    component.sectorFilter = 'academia';
    component.applyFiltersAndSearch();
    expect(component.filteredOrganizations.every((org) => org.sector === 'academia')).toBe(true);
  });

  it('should sort organizations by name', () => {
    component.sortBy('name');
    const names = component.filteredOrganizations.map((org) => org.name);
    const sortedNames = [...names].sort();
    expect(names).toEqual(sortedNames);
  });

  it('should toggle sort direction', () => {
    component.sortBy('name');
    const ascNames = component.filteredOrganizations.map((org) => org.name);
    component.sortBy('name');
    const descNames = component.filteredOrganizations.map((org) => org.name);
    expect(ascNames).not.toEqual(descNames);
  });

  it('should clear all filters', () => {
    component.verifiedFilter = true;
    component.sectorFilter = 'academia';
    component.searchValue = 'test';
    component.clearFilters();
    expect(component.verifiedFilter).toBeNull();
    expect(component.sectorFilter).toBeNull();
    expect(component.searchValue).toBe('');
  });

  it('should open edit modal with selected organization', () => {
    const org = component.organizations[0];
    component.openEditModal(org);
    expect(component.displayEditModal).toBe(true);
    expect(component.selectedOrganization).toEqual(org);
    expect(component.editForm.name).toBe(org.name);
  });

  it('should save organization changes', () => {
    const org = component.organizations[0];
    component.openEditModal(org);
    component.editForm.name = 'Updated Name';
    component.saveOrganization();
    expect(toasterService.success).toHaveBeenCalled();
    expect(component.displayEditModal).toBe(false);
  });

  it('should delete organization', () => {
    const initialCount = component.organizations.length;
    const org = component.organizations[0];
    component.selectedOrganization = org;
    component.deleteOrganization();
    expect(component.organizations.length).toBe(initialCount - 1);
    expect(toasterService.success).toHaveBeenCalled();
  });

  it('should toggle level selection', () => {
    component.editForm.levels = [];
    component.toggleLevel('elementary');
    expect(component.editForm.levels).toContain('elementary');
    component.toggleLevel('elementary');
    expect(component.editForm.levels).not.toContain('elementary');
  });
});
