import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaffoldComponent } from './scaffold.component';

describe('ScaffoldComponent', () => {
  let component: ScaffoldComponent;
  let fixture: ComponentFixture<ScaffoldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaffoldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaffoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
