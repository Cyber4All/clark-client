import { UntypedFormControl, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let authValidation;
  let auth;
  let router;
  let orgService;
  let cookieAgreement;
  let route;

  beforeEach(() => {
    authValidation = {
      getInputFormControl: jest.fn((type: string) => new UntypedFormControl('', type ? Validators.required : null)),
      getErrorState: jest.fn(() => of(false)),
      showError: jest.fn(),
    };

    auth = {
      register: jest.fn().mockResolvedValue({}),
      usernameInUse: jest.fn().mockResolvedValue({ identifierInUse: false }),
      emailInUse: jest.fn().mockResolvedValue({ identifierInUse: false }),
    };

    router = {
      navigate: jest.fn(),
    };

    orgService = {
      searchOrganizations: jest.fn(() => of([])),
      suggestDomain: jest.fn(() => of({ organization: null })),
      createOrganization: jest.fn(() => of({
        organization: {
          _id: 'created-org-id',
          name: 'Manual Org',
        }
      })),
      clearCache: jest.fn(),
    };

    cookieAgreement = {
      getCookieAgreementVal: jest.fn(() => true),
    };

    route = {
      parent: {
        data: of({}),
      },
      snapshot: {
        queryParams: {},
      },
    };

    component = new RegisterComponent(
      authValidation,
      auth,
      router,
      orgService,
      cookieAgreement,
      route as any,
    );
  });

  it('should move from info to account for listed organizations', () => {
    component.currentTemp = component.TEMPLATES.info.temp;
    component.shouldCreateOrganization = false;

    component.nextTemp();

    expect(component.currentTemp).toBe(component.TEMPLATES.account.temp);
    expect(component.currentIndex).toBe(component.TEMPLATES.account.index);
  });

  it('should move from info to organization when custom organization flow is enabled', () => {
    component.currentTemp = component.TEMPLATES.info.temp;
    component.shouldCreateOrganization = true;

    component.nextTemp();

    expect(component.currentTemp).toBe(component.TEMPLATES.organization.temp);
    expect(component.currentIndex).toBe(component.TEMPLATES.organization.index);
  });

  it('should go back from account to organization in the custom organization flow', () => {
    component.currentTemp = component.TEMPLATES.account.temp;
    component.shouldCreateOrganization = true;

    component.goBack();

    expect(component.currentTemp).toBe(component.TEMPLATES.organization.temp);
    expect(component.currentIndex).toBe(component.TEMPLATES.organization.index);
  });

  it('should only allow manual organization entry after first name, last name, and email are valid', () => {
    expect(component.canEnterCustomOrganizationFlow).toBe(false);

    component.infoFormGroup.patchValue({
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
    });

    expect(component.canEnterCustomOrganizationFlow).toBe(true);
  });

  it('should create an organization before registering a custom-organization user', async () => {
    component.shouldCreateOrganization = true;
    component.regInfo.firstname = 'Test';
    component.regInfo.lastname = 'User';
    component.regInfo.email = 'test@example.com';
    component.regInfo.username = 'tester';
    component.regInfo.password = 'secret';
    component.organizationFormGroup.setValue({
      name: 'Manual Org',
      sector: 'academia',
      levels: ['undergraduate', 'graduate'],
      state: 'MD',
      country: 'USA',
    });

    await component.submit();

    expect(orgService.createOrganization).toHaveBeenCalledWith({
      name: 'Manual Org',
      sector: 'academia',
      levels: ['undergraduate', 'graduate'],
      state: 'MD',
      country: 'USA',
    });
    expect(auth.register).toHaveBeenCalledWith(expect.objectContaining({
      organizationId: 'created-org-id',
    }));
  });

  it('should send an empty levels array when no organization levels are selected', async () => {
    component.shouldCreateOrganization = true;
    component.regInfo.firstname = 'Test';
    component.regInfo.lastname = 'User';
    component.regInfo.email = 'test@example.com';
    component.regInfo.username = 'tester';
    component.regInfo.password = 'secret';
    component.organizationFormGroup.setValue({
      name: 'Manual Org',
      sector: 'academia',
      levels: [],
      state: '',
      country: '',
    });

    await component.submit();

    expect(orgService.createOrganization).toHaveBeenCalledWith(expect.objectContaining({
      levels: [],
    }));
  });

  it('should return to listed-organization mode when an organization is selected', () => {
    component.shouldCreateOrganization = true;

    component.selectOrg({
      _id: 'existing-org-id',
      name: 'Existing Org',
    } as any);

    expect(component.shouldCreateOrganization).toBe(false);
    expect(component.selectedOrg).toBe('existing-org-id');
    expect(component.regInfo.organization).toBe('Existing Org');
  });
});
