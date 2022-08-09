import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialNotesComponent } from './material-notes.component';

describe('MaterialNotesComponent', () => {
  let component: MaterialNotesComponent;
  let fixture: ComponentFixture<MaterialNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
