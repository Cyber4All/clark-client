import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsComponent } from './details.component';
import { LearningObjectService } from '../learning-object.service';
import { SplashComponent } from './components/splash/splash.component';
import { DescriptionComponent } from './components/description/description.component';
import { ActionPadComponent } from './components/action-pad/action-pad.component';
import { LengthComponent } from './components/splash/components/length/length.component';
import { VersionCardComponent } from './components/version-card/version-card.component';
import { OutcomeComponent } from './components/outcome/outcome.component';
import { MaterialsComponent } from './components/materials/materials.component';
import { AcademicLevelCardComponent } from './components/academic-level-card/academic-level-card.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { HttpClientModule } from '@angular/common/http';
import { CollectionService } from 'app/core/collection.service';
import { LearningObject } from '@entity';

describe('DetailsComponent', () => {
  let component: DetailsComponent;
  let fixture: ComponentFixture<DetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, SharedPipesModule, HttpClientModule],
      declarations: [
        DetailsComponent,
        SplashComponent,
        DescriptionComponent,
        LengthComponent,
        ActionPadComponent,
        VersionCardComponent,
        OutcomeComponent,
        MaterialsComponent,
        AcademicLevelCardComponent
      ],
      providers: [ LearningObjectService, CollectionService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsComponent);
    component = fixture.componentInstance;
    component.learningObject = new LearningObject();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
