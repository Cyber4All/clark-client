import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutClarkComponent } from './about-us.component';

describe('AboutUsComponent', () => {
  let component: AboutClarkComponent;
  let fixture: ComponentFixture<AboutClarkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutClarkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutClarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
