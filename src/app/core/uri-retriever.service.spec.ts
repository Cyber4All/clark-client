import { TestBed } from '@angular/core/testing';
import { UriRetrieverService } from './uri-retriever.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@env/environment';

describe('UriRetrieverService', () => {

  let httpTestingController: HttpTestingController;
  let uriRetrieverService: UriRetrieverService;

  const mockResponse = {
    id: '12345678901234567890',
    name: 'Test Object',
    author: 'jdoe',
    resourceUris: {
      outcomes: 'Test Outcome URI',
      children: 'Test Children URI',
      materials: 'Test Materials URI',
      metrics: 'Test Metrics URI',
      parents: 'Test Parents URI',
      ratings: 'Test Ratings URI'
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [ UriRetrieverService ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    uriRetrieverService = TestBed.get(UriRetrieverService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  /////////////////////////
  //    All RESOURCES    //
  /////////////////////////

  describe('#getLearningObject', () => {

    it('should get a learning object by its cuid, version, and author username', done => {
      const mockParams = {
        cuidInfo: { cuid: 'whee-im-a-cuid' },
        author: 'jdoe'
      };

      uriRetrieverService.getLearningObject(mockParams).subscribe(object => {
        expect(object.name).toBe(mockResponse.name);
        done();
      });

      // tslint:disable-next-line: max-line-length
      const uri = `${environment.apiURL}/users/${encodeURIComponent(mockParams.author)}/learning-objects/${encodeURIComponent(mockParams.cuidInfo.cuid)}`;
      const req = httpTestingController.expectOne(uri);
      req.flush(mockResponse);
    });

    it('should get a learning object by its id', done => {
      const mockParams = {
        id: '12345678901234567890',
      };

      uriRetrieverService.getLearningObject(mockParams).subscribe(object => {
        expect(object.name).toBe(mockResponse.name);
        expect(object.id).toBe(mockResponse.id);
        done();
      });

      const uri = `${environment.apiURL}/learning-objects/${mockParams.id}`;
      const req = httpTestingController.expectOne(uri);
      req.flush(mockResponse);
    });

    it('should get a learning object by author, cuid, and version with all resources', done => {
      const mockParams = {
        cuidInfo: { cuid: 'whee-im-a-cuid' },
        author: 'jdoe'
      };

      uriRetrieverService.getLearningObject(
        mockParams,
        ['children', 'outcomes', 'materials', 'metrics', 'parents', 'ratings']
      ).subscribe(object => {
        expect(object.name).toBe(mockResponse.name);
        expect(object.children).toEqual([]);
        expect(object.outcomes).toEqual([]);
        expect(object.materials).toEqual([]);
        expect(object.metrics).toEqual({saves: 0, downloads: 0});
        expect(object.parents).toEqual([]);
        expect(object.ratings).toBeUndefined();
        done();
      });

      // tslint:disable-next-line: max-line-length
      const uri = `${environment.apiURL}/users/${encodeURIComponent(mockParams.author)}/learning-objects/${encodeURIComponent(mockParams.cuidInfo.cuid)}`;
      httpTestingController.expectOne(uri).flush(mockResponse);
      httpTestingController.expectOne(mockResponse.resourceUris.children).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.materials).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.metrics).flush({saves: 0, downloads: 0});
      httpTestingController.expectOne(mockResponse.resourceUris.outcomes).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.parents).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.ratings).flush(null);
    });

    it('should get a learning object by author, cuid, and version with the specified resources', done => {
      const mockParams = {
        cuidInfo: { cuid: 'whee-im-a-cuid' },
        author: 'jdoe'
      };

      uriRetrieverService.getLearningObject(mockParams, ['children', 'metrics', 'parents']).subscribe(object => {
        expect(object.name).toBe(mockResponse.name);
        expect(object.children).toEqual([]);
        expect(object.metrics).toEqual({saves: 10, downloads: 10});
        expect(object.parents).toEqual([]);
        done();
      });

      // tslint:disable-next-line: max-line-length
      const uri = `${environment.apiURL}/users/${encodeURIComponent(mockParams.author)}/learning-objects/${encodeURIComponent(mockParams.cuidInfo.cuid)}`;
      httpTestingController.expectOne(uri).flush(mockResponse);
      httpTestingController.expectOne(mockResponse.resourceUris.children).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.metrics).flush({saves: 10, downloads: 10});
      httpTestingController.expectOne(mockResponse.resourceUris.parents).flush([]);
    });

    it('should get the Learning Object by id with all of the available resources', done => {
      const mockParams = {
        id: '12345678901234567890',
      };

      uriRetrieverService.getLearningObject(
        mockParams,
        ['children', 'outcomes', 'materials', 'metrics', 'parents', 'ratings']
      ).subscribe(object => {
        expect(object.name).toBe(mockResponse.name);
        expect(object.children).toEqual([]);
        expect(object.outcomes).toEqual([]);
        expect(object.materials).toEqual([]);
        expect(object.metrics).toEqual({saves: 0, downloads: 0});
        expect(object.parents).toEqual([]);
        expect(object.ratings).toBeUndefined();
        done();
      });

      const uri = `${environment.apiURL}/learning-objects/${mockParams.id}`;
      httpTestingController.expectOne(uri).flush(mockResponse);
      httpTestingController.expectOne(mockResponse.resourceUris.children).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.materials).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.metrics).flush({saves: 0, downloads: 0});
      httpTestingController.expectOne(mockResponse.resourceUris.outcomes).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.parents).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.ratings).flush(null);
    });

    it('should get the Learning Object by id of the learning object ', done => {
      const mockParams = {
        id: '12345678901234567890',
      };

      uriRetrieverService.getLearningObject(
        mockParams,
        ['children', 'materials', 'parents']
      ).subscribe(object => {
        expect(object.name).toBe(mockResponse.name);
        expect(object.children).toEqual([]);
        expect(object.materials).toEqual([]);
        expect(object.parents).toEqual([]);
        done();
      });

      const uri = `${environment.apiURL}/learning-objects/${mockParams.id}`;
      httpTestingController.expectOne(uri).flush(mockResponse);
      httpTestingController.expectOne(mockResponse.resourceUris.children).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.materials).flush([]);
      httpTestingController.expectOne(mockResponse.resourceUris.parents).flush([]);
    });

    it('should throw and error with insufficient learning object identifiers', done => {
      expect(() => uriRetrieverService.getLearningObject({})).toThrowError();
      done();
    });
  });
});
