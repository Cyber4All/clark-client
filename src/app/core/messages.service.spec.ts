import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [MessagesService]
    });
  });

  it('should be created', inject([MessagesService], (service: MessagesService) => {
    expect(service).toBeTruthy();
  }));
  it('should return a status', inject([MessagesService], (service: MessagesService) => {
    return service.getStatus().then(val => {
      console.log(val);
      expect(val).toBeTruthy();
    });
  }));
});
