import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserService } from '../../../core/user.service';
import { AuthService } from '../../../core/auth.service';
// import { NotificationService } from '../../../shared/notifications';
// import { UserEditInformationComponent } from './user-edit-information.component';
// import { CookieService } from 'ngx-cookie';
// import { RouterTestingModule } from '@angular/router/testing';
// import { HttpModule } from '@angular/http';
// import { Router, Routes } from '@angular/router';

// const auth_routes: Routes = [
//   {
//       path: '',  children: [
//           { path: '', redirectTo: 'login', pathMatch: 'full' },
//           { path: 'login' },
//           { path: 'register' },
//           { path: 'forgot-password' },
//           { path: 'reset-password' },
//           // Catch All
//           { path: '**', redirectTo: 'login', pathMatch: 'full' }
//       ]
//   }
// ];

// describe('UserEditInformationComponent', () => {
//   let component: UserEditInformationComponent;
//   let fixture: ComponentFixture<UserEditInformationComponent>;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpModule, RouterTestingModule.withRoutes(auth_routes)],
//       providers: [UserService, NotificationService, AuthService, CookieService],
//       declarations: [ UserEditInformationComponent ]
//     })
//     .compileComponents();
//   });

//   beforeEach(() => {
//     fixture = TestBed.createComponent(UserEditInformationComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
