import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionRetryComponent } from './connection-retry.component';

describe('ConnectionRetryComponent', () => {
  let component: ConnectionRetryComponent;
  let fixture: ComponentFixture<ConnectionRetryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionRetryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionRetryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
