import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardItemComponent } from './dashboard-item.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ContextMenuModule } from 'app/shared/modules/contextmenu/contextmenu.module';
import { AuthService } from 'app/core/auth-module/auth.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { LearningObject, User } from '@entity';
import { DashboardLearningObject } from '../../../old-dashboard/old-dashboard.component';
import { TipDirective } from 'app/shared/directives/tip.directive';

describe('DashboardItemComponent', () => {
  let component: DashboardItemComponent;
  let fixture: ComponentFixture<DashboardItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [DashboardItemComponent, TipDirective],
    teardown: { destroyAfterEach: false },
    imports: [RouterTestingModule,
        ContextMenuModule.forRoot(),
        CookieModule.forRoot()],
    providers: [
        { provide: AuthService, useValue: { user: new User() } },
        CollectionService,
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardItemComponent);
    component = fixture.componentInstance;
    component.learningObject = new LearningObject() as DashboardLearningObject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
