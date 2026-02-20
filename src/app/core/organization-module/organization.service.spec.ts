import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.types';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let httpMock: HttpTestingController;

  const organization: Organization = {
    _id: 'org-1',
    name: 'Towson University',
    normalizedName: 'towson university',
    sector: 'academia',
    levels: ['undergraduate'],
    domains: ['towson.edu'],
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrganizationService],
    });

    service = TestBed.inject(OrganizationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets organization by id when API returns wrapped response shape', (done) => {
    service.getOrganizationById('org-1').subscribe((result) => {
      expect(result._id).toBe('org-1');
      expect(result.name).toBe('Towson University');
      done();
    });

    const request = httpMock.expectOne(`${environment.apiURL}/organizations/org-1`);
    expect(request.request.method).toBe('GET');
    request.flush({ organization });
  });

  it('applies defaults for missing createdAt/updatedAt', (done) => {
    service.getOrganizationById('org-1').subscribe((result) => {
      expect(result._id).toBe('org-1');
      expect(result.name).toBe('Towson University');
      expect(result.createdAt).toBe('');
      expect(result.updatedAt).toBe('');
      done();
    });

    const request = httpMock.expectOne(`${environment.apiURL}/organizations/org-1`);
    expect(request.request.method).toBe('GET');
    request.flush({
      organization: {
        ...organization,
        createdAt: undefined,
        updatedAt: undefined,
      }
    });
  });

  it('searches organizations from wrapped search response', (done) => {
    service.searchOrganizations({ text: 'texas' }).subscribe((results) => {
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Towson University');
      done();
    });

    const request = httpMock.expectOne((req) =>
      req.url === `${environment.apiURL}/organizations` && req.params.get('text') === 'texas'
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      organizations: [organization],
      total: 1,
      page: 1,
      limit: 10,
    });
  });
});
