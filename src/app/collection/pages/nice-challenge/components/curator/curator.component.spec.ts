import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuratorComponent } from './curator.component';

describe('CuratorComponent', () => {
  let component: CuratorComponent;
  let fixture: ComponentFixture<CuratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
