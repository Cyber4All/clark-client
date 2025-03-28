import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvGenModalComponent } from './csv-gen-modal.component';

describe('CsvGenModalComponent', () => {
  let component: CsvGenModalComponent;
  let fixture: ComponentFixture<CsvGenModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CsvGenModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CsvGenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
