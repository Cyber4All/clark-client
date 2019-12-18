import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplashComponent } from './splash.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { LengthComponent } from './components/length/length.component';
import { CollectionService } from 'app/core/collection.service';
import { HttpClientModule } from '@angular/common/http';
import { LearningObject } from '@entity';
import { createCanvas } from 'canvas';

describe('SplashComponent', () => {
  let component: SplashComponent;
  let fixture: ComponentFixture<SplashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, SharedPipesModule, HttpClientModule ],
      declarations: [ SplashComponent, LengthComponent ],
      providers: [ CollectionService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    // stub a canvas element for the grid pattern
    const canvas = createCanvas(400, 1400) as unknown as HTMLCanvasElement;
    canvas.setAttribute = (attr: string, value: any) => { };

    fixture = TestBed.createComponent(SplashComponent);
    component = fixture.componentInstance;
    component.learningObject = new LearningObject();
    component.canvas = canvas;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
