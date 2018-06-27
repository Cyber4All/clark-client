import { TestBed, inject } from '@angular/core/testing';
// import { HttpClientModule } from '@angular/http';
import { CollectionService } from './collection.service';
import { HttpClientModule } from '@angular/common/http';

describe('CollectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [CollectionService]
    });
  });

  it('should be created', inject([CollectionService], (service: CollectionService) => {
    expect(service).toBeTruthy();
  }));
});
