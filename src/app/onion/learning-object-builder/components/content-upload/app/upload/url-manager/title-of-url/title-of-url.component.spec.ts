import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleOfUrlComponent } from "./title-of-url.component";

describe('TitleOfUrlComponent', () => {
  let component: TitleOfUrlComponent;
  let fixture: ComponentFixture<TitleOfUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TitleOfUrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleOfUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
