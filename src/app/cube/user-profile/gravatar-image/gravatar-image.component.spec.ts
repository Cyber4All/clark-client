import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GravatarImageComponent } from './gravatar-image.component';

describe('GravatarImageComponent', () => {
  let component: GravatarImageComponent;
  let fixture: ComponentFixture<GravatarImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GravatarImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GravatarImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
