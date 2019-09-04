import { TestBed } from '@angular/core/testing';

import { UriRetrieverService } from './uri-retriever.service';

describe('UriRetrieverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UriRetrieverService = TestBed.get(UriRetrieverService);
    expect(service).toBeTruthy();
  });
});
