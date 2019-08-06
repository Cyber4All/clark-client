import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeleporterComponent } from './teleporter.component';

describe('TeleporterComponent', () => {
  let component: TeleporterComponent;
  let fixture: ComponentFixture<TeleporterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeleporterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeleporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
