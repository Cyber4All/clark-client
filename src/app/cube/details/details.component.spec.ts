import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsComponent } from './details.component';
import { LearningObjectService } from '../learning-object.service';
import { SplashComponent } from './components/splash/splash.component';
import { DescriptionComponent } from './components/description/description.component';
import { LengthComponent } from './components/splash/length/length.component';
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
      declarations: [ DetailsComponent, SplashComponent, DescriptionComponent, LengthComponent ],
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
