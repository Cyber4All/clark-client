import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAuthorComponent } from './change-author.component';

describe('ChangeAuthorComponent', () => {
  let component: ChangeAuthorComponent;
  let fixture: ComponentFixture<ChangeAuthorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeAuthorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
