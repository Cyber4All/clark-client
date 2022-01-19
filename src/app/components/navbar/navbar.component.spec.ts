import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalService } from '../../shared/advanced/modals';
import { Router, ActivatedRoute } from '@angular/router';
import { LibraryService } from '../../core/library.service';
import { AuthService } from '../../core/auth.service';
import { NavbarComponent } from './navbar.component';
import { CookieService } from 'ngx-cookie';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule, HttpClientModule, ActivatedRoute],
    providers: [ModalService, LibraryService, AuthService, CookieService],
    declarations: [NavbarComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  test('snap of component', () => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
