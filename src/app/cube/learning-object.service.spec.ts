import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { LearningObjectService } from './learning-object.service';

describe('LearningObjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [LearningObjectService]
    });
  });

  it('should be created', inject([LearningObjectService], (service: LearningObjectService) => {
    expect(service).toBeTruthy();
  }));
});
