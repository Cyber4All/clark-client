import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelevancyBuilderComponent } from './relevancy-builder.component';

describe('RelevancyBuilderComponent', () => {
  let component: RelevancyBuilderComponent;
  let fixture: ComponentFixture<RelevancyBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelevancyBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelevancyBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
