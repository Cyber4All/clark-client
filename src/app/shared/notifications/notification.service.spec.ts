import { TestBed, inject } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });
  });

  it('should be created', inject([NotificationService], (service: NotificationService) => {
    expect(service).toBeTruthy();
  }));
  it('should create a notification', inject([NotificationService], (service: NotificationService) => {
    service.notify('title', '', '', '');
    expect(service.content).toMatchObject({ title: 'title', text: '', classes: '', icon: '' });
  }));
});

