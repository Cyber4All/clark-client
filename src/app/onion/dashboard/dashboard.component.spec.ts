import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { TooltipModule } from 'app/shared/tooltips/tip.module';
import { LearningObjectService } from '../core/learning-object.service';
import { AuthService } from 'app/core/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { CollectionService } from 'app/core/collection.service';
import { ChangelogService } from 'app/core/changelog.service';
import { ToasterModule } from 'app/shared/toaster';
import { ContextMenuModule } from 'app/shared/contextmenu/contextmenu.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { User } from '@entity';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ DashboardComponent ],
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
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
