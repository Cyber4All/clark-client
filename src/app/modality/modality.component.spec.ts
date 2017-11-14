/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ModalityComponent } from './modality.component';

describe('ModalityComponent', () => {
  let component: ModalityComponent;
  let fixture: ComponentFixture<ModalityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
