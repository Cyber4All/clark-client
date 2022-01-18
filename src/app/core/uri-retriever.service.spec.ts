import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UriRetrieverService } from './uri-retriever.service';

describe('UriRetrieverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [UriRetrieverService]
    });
  });

  it('should be created', inject([UriRetrieverService], (service: UriRetrieverService) => {
    expect(service).toBeTruthy();
  }));
});
