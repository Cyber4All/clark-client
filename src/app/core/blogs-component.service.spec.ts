import { TestBed } from '@angular/core/testing';

import { BlogsComponentService } from './blogs-component.service';

describe('BlogsComponentService', () => {
  let service: BlogsComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlogsComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
