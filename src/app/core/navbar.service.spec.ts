import { TestBed, inject } from '@angular/core/testing';

import { NavbarService } from './navbar.service';

describe('NavbarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: [NavbarService],
    teardown: { destroyAfterEach: false }
});
  });

  it('should be created', inject([NavbarService], (service: NavbarService) => {
    expect(service).toBeTruthy();
  }));
});
