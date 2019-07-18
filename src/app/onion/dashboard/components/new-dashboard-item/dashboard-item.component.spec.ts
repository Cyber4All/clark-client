import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardItemComponent } from './dashboard-item.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TooltipModule } from 'app/shared/tooltips/tip.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ContextMenuModule } from 'app/shared/contextmenu/contextmenu.module';
import { AuthService } from 'app/core/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { CollectionService } from 'app/core/collection.service';
import { LearningObject, User } from '@entity';
import { DashboardLearningObject } from '../../../old-dashboard/old-dashboard.component';

describe('DashboardItemComponent', () => {
  let component: DashboardItemComponent;
  let fixture: ComponentFixture<DashboardItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ DashboardItemComponent ],
      imports: [
        TooltipModule,
        RouterTestingModule,
        ContextMenuModule.forRoot(),
        HttpClientModule,
        CookieModule.forRoot()
      ],
      providers: [
        { provide: AuthService, useValue: { user: new User() } },
        CollectionService
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
