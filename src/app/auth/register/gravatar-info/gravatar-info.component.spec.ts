import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GravatarInfoComponent } from './gravatar-info.component';

describe('GravatarInfoComponent', () => {
  let component: GravatarInfoComponent;
  let fixture: ComponentFixture<GravatarInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GravatarInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GravatarInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
