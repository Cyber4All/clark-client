import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutagePageComponent } from './outage-page.component';

describe('OutagePageComponent', () => {
  let component: OutagePageComponent;
  let fixture: ComponentFixture<OutagePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutagePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
