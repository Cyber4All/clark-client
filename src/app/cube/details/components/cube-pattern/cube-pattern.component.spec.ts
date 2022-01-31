import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubePatternComponent } from './cube-pattern.component';

describe('CubePatternComponent', () => {
  let component: CubePatternComponent;
  let fixture: ComponentFixture<CubePatternComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [CubePatternComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubePatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
