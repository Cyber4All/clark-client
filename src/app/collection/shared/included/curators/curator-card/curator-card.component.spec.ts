import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratorCardComponent } from './curator-card.component';

describe('CuratorCardComponent', () => {
  let component: CuratorCardComponent;
  let fixture: ComponentFixture<CuratorCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CuratorCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuratorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
