import { TestBed, inject } from '@angular/core/testing';
import { FileStorageService } from './file-storage.service';
import { HttpModule } from '@angular/http';

describe('FileStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      providers: [FileStorageService]
    });
  });

  it('should ...', inject([FileStorageService], (service: FileStorageService) => {
    expect(service).toBeTruthy();
  }));
});
