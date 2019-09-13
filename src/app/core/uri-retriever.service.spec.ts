import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { UriRetrieverService } from './uri-retriever.service';
import { HttpClientModule, HttpXhrBackend, HttpResponse, HttpRequest } from '@angular/common/http';
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

    it('should get a learning object by its name and author username', done => {
      const mockParams = {
        name: 'Test Object',
        author: 'jdoe'
      };

      uriRetrieverService.getLearningObject(mockParams).subscribe(object => {
        expect(object.name).toBe(mockResponse.name);
        done();
      });

      const url = `${environment.apiURL}/learning-objects/${encodeURIComponent('jdoe')}/${encodeURIComponent('Test Object')}`;
      const req = httpTestingController.expectOne(url);
      req.flush(mockResponse);
    });

    it('should get a learning object by its id', done => {
      const mockParams = {
        id: '12345678901234567890',
      };

      uriRetrieverService.getLearningObject(mockParams).subscribe(object => {
        expect(object.name).toEqual(mockResponse.name);
        expect(object.id).toEqual(mockResponse.id);
        done();
      });

      const uri = `${environment.apiURL}/learning-objects/${mockParams.id}`;
      const req = httpTestingController.expectOne(uri);
      req.flush(mockResponse);
    });

    // // FIXME!
    // it('should get a learning object with specified resources', (() => {
    //   uriRetrieverService.getLearningObject(
    //     {author: 'skaza', name: encodeURI('Buffer Overflow - CS0 - Java')},
    //     ['children', 'outcomes', 'materials', 'metrics', 'parents', 'ratings']
    //   ).then(object => {
    //     expect(object.children).toEqual([]);
    //   });
    //   const uri = (uriRetrieverService as any).setRoute({author: 'skaza', name: 'Buffer Overflow - CS0 - Java'});
    //   const req = httpTestingController.expectOne(uri);
    //   req.flush(uri);
    // }));

    // // FIXME!
    // it('should throw an error with insufficient learning object identifiers', () => {
    //   inject([UriRetrieverService], (uriRetrieverService) => {
    //     const mockResponse = 'Cannot find Learning Object. No identifiers found.';
    //     expect(2 + 2).toMatch(mockResponse);
    //   });
    // });
  });
});
