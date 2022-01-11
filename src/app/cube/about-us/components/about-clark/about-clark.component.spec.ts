import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AboutClarkComponent } from './about-clark.component';

describe('AboutClarkComponent', () => {
  let component: AboutClarkComponent;
  let fixture: ComponentFixture<AboutClarkComponent>;

  beforeEach(waitForAsync(() => {
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
