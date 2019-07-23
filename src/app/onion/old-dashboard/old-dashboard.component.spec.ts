import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OldDashboardComponent } from './old-dashboard.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { TooltipModule } from 'app/shared/Shared Modules/tooltips/tip.module';
import { LearningObjectService } from '../core/learning-object.service';
import { AuthService } from 'app/core/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { CollectionService } from 'app/core/collection.service';
import { ChangelogService } from 'app/core/changelog.service';
import { ToasterModule } from 'app/shared/Shared Modules/toaster';
import { ContextMenuModule } from 'app/shared/Shared Modules/contextmenu/contextmenu.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { User } from '@entity';

describe('OldDashboardComponent', () => {
  let component: OldDashboardComponent;
  let fixture: ComponentFixture<OldDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ OldDashboardComponent ],
      imports: [
        TooltipModule,
        RouterTestingModule,
        HttpClientModule,
        CookieModule.forRoot(),
        ToasterModule.forRoot(),
        ContextMenuModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        LearningObjectService,
        { provide: AuthService, useValue: { user: new User() } },
        CollectionService,
        ChangelogService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OldDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
