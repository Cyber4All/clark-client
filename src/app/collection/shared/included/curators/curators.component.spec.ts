import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratorsComponent } from './curators.component';

describe('CuratorsComponent', () => {
  let component: CuratorsComponent;
  let fixture: ComponentFixture<CuratorsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CuratorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
