import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FooterComponent } from './footer.component';
import { UserService } from '../../../core/user.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  const mockRouter = {
    navigate: jasmine.createSpy()
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    providers: [
        { provide: Router, useValue: mockRouter },
        UserService
    ],
    declarations: [FooterComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
