/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CubeFacesComponent } from './cube-faces.component';

describe('CubeFacesComponent', () => {
  let component: CubeFacesComponent;
  let fixture: ComponentFixture<CubeFacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubeFacesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubeFacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
