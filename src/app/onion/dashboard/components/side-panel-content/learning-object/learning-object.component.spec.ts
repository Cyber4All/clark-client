import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectComponent } from './learning-object.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CollectionPipe } from 'app/shared/Shared Components/pipes/collection.pipe';
import { CollectionService } from 'app/core/collection.service';
import { HttpClientModule } from '@angular/common/http';
import { LearningObject } from '@entity';

describe('LearningObjectComponent', () => {
  let component: LearningObjectComponent;
  let fixture: ComponentFixture<LearningObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ LearningObjectComponent, CollectionPipe ],
      imports: [
        HttpClientModule
      ],
      providers: [
        CollectionService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectComponent);
    component = fixture.componentInstance;
    component.learningObject = new LearningObject();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
