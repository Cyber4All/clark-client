import { TestBed, async, inject } from '@angular/core/testing';
import {
  HttpModule,
  Http,
  Response,
  ResponseOptions,
  XHRBackend
} from '@angular/http';
import { MockBackend} from '@angular/http/testing';
import { UriRetrieverService } from './uri-retriever.service';

describe('UriRetrieverService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ {useValue: 'http://example.com'}, UriRetrieverService, { provide: XHRBackend, useClass: MockBackend }],
      imports: [ HttpModule ]
    });
  });

  afterEach(() => {
  });

  /////////////////////////
  //    All RESOURCES    //
  /////////////////////////

  describe('#getLearningObject', () => {
    it('should get a learning object by its name and author username', () => {
      uriRetrieverService.getLearningObject({author: 'skaza', name: encodeURI('Buffer Overflow - CS0 - Java')}).then(object => {
        expect(object.name).toEqual('Buffer Overflow - CS0 - Java');
      });

      const uri = (uriRetrieverService as any).setRoute({author: 'skaza', name: encodeURI('Buffer Overflow - CS0 - Java')});
      const req = httpTestingController.expectOne(uri);
      req.flush({name: 'Buffer Overflow - CS0 - Java'});
    });

    it('should get a learning object by its id', () => {
      uriRetrieverService.getLearningObject({id: '5aa005c3ecba9a264dcd8035'}).then(object => {
        expect(object.name).toEqual('Buffer Overflow - CS0 - Java');
      });

      const uri = (uriRetrieverService as any).setRoute({id: '5aa005c3ecba9a264dcd8035'});
      const req = httpTestingController.expectOne(uri);
      req.flush({name: 'Buffer Overflow - CS0 - Java'});
    });

    // FIXME!
    it('should get a learning object with specified resources', fakeAsync(() => {
      uriRetrieverService.getLearningObject(
        {author: 'skaza', name: encodeURI('Buffer Overflow - CS0 - Java')},
        ['children', 'outcomes', 'materials', 'metrics', 'parents', 'ratings']
      ).then(object => {
        expect(object.children).toEqual([]);
      });
      const uri = (uriRetrieverService as any).setRoute({author: 'skaza', name: 'Buffer Overflow - CS0 - Java'});
      const req = httpTestingController.expectOne(uri);
      req.flush(uri);
    }));

    // FIXME!
    it('should throw an error with insufficient learning object identifiers', () => {
      inject([UriRetrieverService], (uriRetrieverService) => {
        const mockResponse = 'Cannot find Learning Object. No identifiers found.';
        expect(2 + 2).toMatch(mockResponse);
    });
  });
});
