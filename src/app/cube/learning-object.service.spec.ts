import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { LearningObjectService } from './learning-object.service';
import { Subscription } from 'rxjs';

describe('LearningObjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [HttpClientModule],
    providers: [LearningObjectService],
    teardown: { destroyAfterEach: false }
});
  });

  it('should be created', inject([LearningObjectService], (service: LearningObjectService) => {
    expect(service).toBeTruthy();
  }));
  it('should return learning objects', inject([LearningObjectService], (service: LearningObjectService) => {
    const sub: Subscription = service.observeFiltered().subscribe(val => {
      expect(val).toBeTruthy();
    });
    sub.unsubscribe();
  }));
  it('should return filtered objects', inject([LearningObjectService], (service: LearningObjectService) => {
    const result = service.getFilteredObjects();
      expect(result).toBeUndefined();
  }));
  it('should return filtered objects', inject([LearningObjectService], (service: LearningObjectService) => {
      service.clearSearch();
      expect(service.filteredResults).toEqual([]);
  }));
  it('should return a list of objects', inject([LearningObjectService], (service: LearningObjectService) => {
    jest.setTimeout(10000);
    return service.getLearningObjects().then(val => {
      expect(val).toBeTruthy();
    });
  }));
  it('should return a single learning object', inject([LearningObjectService], (service: LearningObjectService) => {
    return service.getLearningObject('nvisal1', 'Test Learning Object').then(val => {
      expect(val).toBeTruthy();
    });
  }));
  it('should return a users learning objects', inject([LearningObjectService], (service: LearningObjectService) => {
    return service.getUsersLearningObjects('nvisal1').then(val => {
      expect(val).toBeTruthy();
    });
  }));
});
