import { TestBed, inject } from '@angular/core/testing';

import { MappingsFilterService } from './mappings-filter.service';

describe('MappingsFilterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MappingsFilterService]
    });
  });

  it('should be created', inject([MappingsFilterService], (service: MappingsFilterService) => {
    expect(service).toBeTruthy();
  }));
});
