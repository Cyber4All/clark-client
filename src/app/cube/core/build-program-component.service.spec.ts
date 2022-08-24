import { TestBed } from '@angular/core/testing';

import { BuildProgramComponentService } from './build-program-component.service';

describe('BuildProgramComponentService', () => {
  let service: BuildProgramComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuildProgramComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
