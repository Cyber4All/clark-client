import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratorItemComponent } from './curator-item.component';

describe('CuratorItemComponent', () => {
  let component: CuratorItemComponent;
  let fixture: ComponentFixture<CuratorItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuratorItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuratorItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
