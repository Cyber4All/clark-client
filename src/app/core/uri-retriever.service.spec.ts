import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { UriRetrieverService } from './uri-retriever.service';
import { HttpClientModule, HttpXhrBackend, HttpResponse, HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('UriRetrieverService', () => {

  let httpTestingController: HttpTestingController;
  let uriRetrieverService: UriRetrieverService;

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
      const mockResponse = {
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
      const url = `http://localhost:3000/learning-objects/${encodeURIComponent('jdoe')}/${encodeURIComponent('Test Object')}`;

      uriRetrieverService.getLearningObject(mockParams).subscribe(object => {
        expect(object.name).toBe(null);
        done();
      });

      const req = httpTestingController.expectOne(url);
      req.flush(mockResponse);
    });

    // it('should get a learning object by its id', () => {
    //   uriRetrieverService.getLearningObject({id: '5aa005c3ecba9a264dcd8035'}).then(object => {
    //     expect(object.name).toEqual('Buffer Overflow - CS0 - Java');
    //   });

    //   const uri = (uriRetrieverService as any).setRoute({id: '5aa005c3ecba9a264dcd8035'});
    //   const req = httpTestingController.expectOne(uri);
    //   req.flush({name: 'Buffer Overflow - CS0 - Java'});
    // });

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
