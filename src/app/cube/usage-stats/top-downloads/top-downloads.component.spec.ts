import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopDownloadsComponent } from './top-downloads.component';

describe('TopDownloadsComponent', () => {
  let component: TopDownloadsComponent;
  let fixture: ComponentFixture<TopDownloadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopDownloadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
