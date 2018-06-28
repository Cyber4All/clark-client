import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { OutcomeService } from './outcome.service';

describe('OutcomeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [OutcomeService]
    });
  });

  it('should be created', inject([OutcomeService], (service: OutcomeService) => {
    expect(service).toBeTruthy();
  }));
  it('should return outcomes', inject([OutcomeService], (service: OutcomeService) => {
    return service.getOutcomes().then(val => {
      console.log(val);
      expect(val).toBeTruthy();
    });
  }));
});
