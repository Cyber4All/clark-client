import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectListItemComponent } from './learning-object-list-item.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ContextMenuModule } from 'app/shared/shared modules/contextmenu/contextmenu.module';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { AuthService } from 'app/core/auth.service';
import { User, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection.service';
import { DashboardLearningObject } from 'app/onion/old-dashboard/old-dashboard.component';
import { TipDirective } from 'app/shared/shared components/directives/tip.directive';

describe('DashboardItemComponent', () => {
  let component: LearningObjectListItemComponent;
  let fixture: ComponentFixture<LearningObjectListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ LearningObjectListItemComponent, TipDirective ],
      imports: [
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
    fixture = TestBed.createComponent(LearningObjectListItemComponent);
    component = fixture.componentInstance;
    component.learningObject = new LearningObject() as DashboardLearningObject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
