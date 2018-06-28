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
  it('should return the number of mappings - should be false', inject([MappingsFilterService], (service: MappingsFilterService) => {
    expect(service.hasMappings).toBeFalsy();
  }));
  it('should return if has text - should be false', inject([MappingsFilterService], (service: MappingsFilterService) => {
    expect(service.hasText).toBeFalsy();
  }));
});

