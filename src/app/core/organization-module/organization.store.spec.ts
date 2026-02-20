import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrganizationService } from './organization.service';
import { OrganizationStore } from './organization.store';
import { Organization } from './organization.types';

describe('OrganizationStore', () => {
  let store: OrganizationStore;
  let orgService: jasmine.SpyObj<OrganizationService>;

  const makeOrg = (id: string, name: string): Organization => ({
    _id: id,
    name,
    normalizedName: name.toLowerCase(),
    sector: 'academia',
    levels: ['undergraduate'],
    domains: [],
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  beforeEach(() => {
    orgService = jasmine.createSpyObj<OrganizationService>('OrganizationService', ['getOrganizationById']);

    TestBed.configureTestingModule({
      providers: [
        OrganizationStore,
        { provide: OrganizationService, useValue: orgService },
      ],
    });

    store = TestBed.inject(OrganizationStore);
  });

  it('caches by organization ID and avoids duplicate service calls', (done) => {
    const org = makeOrg('org-1', 'towson university');
    orgService.getOrganizationById.and.returnValue(of(org));

    store.organization$('org-1').subscribe((first) => {
      expect(first?._id).toBe('org-1');

      store.organization$('org-1').subscribe((second) => {
        expect(second?._id).toBe('org-1');
        expect(orgService.getOrganizationById).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  it('evicts cache on error so next request retries', (done) => {
    orgService.getOrganizationById.and.returnValue(throwError(() => new Error('boom')));

    store.organization$('org-err').subscribe((first) => {
      expect(first).toBeNull();

      store.organization$('org-err').subscribe((second) => {
        expect(second).toBeNull();
        expect(orgService.getOrganizationById).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  it('refresh(id) invalidates one cached organization', (done) => {
    orgService.getOrganizationById.and.returnValues(
      of(makeOrg('org-2', 'towson university')),
      of(makeOrg('org-2', 'UCLA')),
    );

    store.organizationName$('org-2').subscribe((firstName) => {
      expect(firstName).toBe('Towson University');

      store.refresh('org-2');

      store.organizationName$('org-2').subscribe((secondName) => {
        expect(secondName).toBe('UCLA');
        expect(orgService.getOrganizationById).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  it('formats organization names with acronym-preserving second-character uppercase heuristic', (done) => {
    orgService.getOrganizationById.and.returnValues(
      of(makeOrg('org-3', 'UCLA')),
      of(makeOrg('org-4', 'towson university')),
    );

    store.organizationName$('org-3').subscribe((acronymName) => {
      expect(acronymName).toBe('UCLA');

      store.organizationName$('org-4').subscribe((titleCaseName) => {
        expect(titleCaseName).toBe('Towson University');
        done();
      });
    });
  });
});
