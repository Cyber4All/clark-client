import { NO_ERRORS_SCHEMA } from '@angular/core';
import { fakeAsync, ComponentFixture, TestBed, tick, flushMicrotasks } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthValidationService } from 'app/core/auth-module/auth-validation.service';
import { AuthService } from 'app/core/auth-module/auth.service';
import { CookieAgreementService } from 'app/core/auth-module/cookie-agreement.service';
import { OrganizationService } from 'app/core/organization-module/organization.service';
import { Organization } from 'app/core/organization-module/organization.types';
import { UserService } from 'app/core/user-module/user.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: any;
  let organizationService: any;

  const suggestedOrganization: Organization = {
    _id: 'org-1',
    name: 'Towson University',
    normalizedName: 'towson university',
    sector: 'academia',
    levels: ['undergraduate'],
    domains: ['towson.edu'],
    isVerified: true,
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'register',
      'usernameInUse',
      'emailInUse'
    ]);
    organizationService = jasmine.createSpyObj<OrganizationService>('OrganizationService', [
      'searchOrganizations',
      'suggestDomain'
    ]);

    authService.usernameInUse.and.returnValue(Promise.resolve({ identifierInUse: false }));
    authService.emailInUse.and.returnValue(Promise.resolve({ identifierInUse: false }));
    authService.register.and.returnValue(Promise.resolve());
    organizationService.searchOrganizations.and.returnValue(of([]));
    organizationService.suggestDomain.and.returnValue(of({ organization: suggestedOrganization }));

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [FormsModule, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        AuthValidationService,
        { provide: AuthService, useValue: authService },
        { provide: OrganizationService, useValue: organizationService },
        { provide: UserService, useValue: {} },
        { provide: CookieAgreementService, useValue: { getCookieAgreementVal: () => true, setShowCookieBanner: () => undefined } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: {} },
            parent: { data: of({}) }
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls suggestDomain after a valid email is entered', fakeAsync(() => {
    component.infoFormGroup.get('email').setValue('user@towson.edu');

    tick(601);
    flushMicrotasks();

    expect(authService.emailInUse).toHaveBeenCalledWith('user@towson.edu');
    expect(organizationService.suggestDomain).toHaveBeenCalledWith('user@towson.edu');
  }));

  it('auto-selects the suggested organization when one is returned', () => {
    (component as any).loadOrganizationSuggestion('user@towson.edu');

    expect(component.suggestedOrganization).toEqual(suggestedOrganization);
    expect(component.selectedOrg).toBe('org-1');
    expect(component.regInfo.organization).toBe('');
  });

  it('shows the organization selector when no organization is suggested', () => {
    organizationService.suggestDomain.and.returnValue(of({ organization: null }));

    (component as any).loadOrganizationSuggestion('user@unknown.example');

    expect(component.suggestedOrganization).toBeNull();
    expect(component.selectedOrg).toBe('');
  });

  it('falls back to the organization selector when suggestion lookup fails', () => {
    organizationService.suggestDomain.and.returnValue(throwError(() => new Error('lookup failed')));

    (component as any).loadOrganizationSuggestion('user@towson.edu');

    expect(component.suggestedOrganization).toBeNull();
    expect(component.selectedOrg).toBe('');
    expect(component.organizationSuggestionLoading).toBe(false);
  });

  it('restores the suggested organization id when the org input is cleared', () => {
    (component as any).loadOrganizationSuggestion('user@towson.edu');

    component.organizationInput$.next('Tow');
    component.organizationInput$.next('');

    expect(component.selectedOrg).toBe('org-1');
  });
});
