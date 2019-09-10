import { TestBed, fakeAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { UriRetrieverService } from './uri-retriever.service';

describe('UriRetrieverService', () => {
  let httpTestingController: HttpTestingController;
  let uriRetrieverService: UriRetrieverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ UriRetrieverService ],
      imports: [ HttpClientTestingModule ]
    });

    uriRetrieverService = TestBed.get(UriRetrieverService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
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
      uriRetrieverService.getLearningObject({})
        .then(object => expect(true).toEqual(false))
        .catch(err => expect(true).toEqual(true));

      const req = httpTestingController.expectNone('');
    });
  });
});
