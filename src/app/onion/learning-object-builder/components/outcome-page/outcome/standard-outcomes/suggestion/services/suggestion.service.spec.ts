import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { SuggestionService } from './suggestion.service';

describe('SuggestionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [SuggestionService]
    });
  });

  it('should be created', inject([SuggestionService], (service: SuggestionService) => {
    expect(service).toBeTruthy();
  }));
  it('should return observable', inject([SuggestionService], (service: SuggestionService) => {
    const result = service.observe();
    expect(result).toBeDefined();
  }));
  it('should return mappings', inject([SuggestionService], (service: SuggestionService) => {
    const result = service.mappings;
    expect(result).toBeDefined();
  }));
  it('should set service.total', inject([SuggestionService], (service: SuggestionService) => {
    service.emit('text');
    expect(service.total).toEqual(0);
  }));
});

