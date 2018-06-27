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
});
