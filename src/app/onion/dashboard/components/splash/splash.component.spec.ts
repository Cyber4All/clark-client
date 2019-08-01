import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SplashComponent } from './splash.component';

describe('SplashComponent', () => {
  let component: SplashComponent;
  let fixture: ComponentFixture<SplashComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplashComponent ],
      imports: [
        NoopAnimationsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
