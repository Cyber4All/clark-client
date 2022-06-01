import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileLearningObjectsComponent } from './profile-learning-objects.component';

describe('ProfileLearningObjectsComponent', () => {
  let component: ProfileLearningObjectsComponent;
  let fixture: ComponentFixture<ProfileLearningObjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileLearningObjectsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileLearningObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
