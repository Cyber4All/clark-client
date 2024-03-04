import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectListItemComponent } from './learning-object-list-item.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ContextMenuModule } from 'app/shared/modules/contextmenu/contextmenu.module';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { AuthService } from 'app/core/auth-module/auth.service';
import { User, LearningObject } from '@entity';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { SharedDirectivesModule } from 'app/shared/directives/shared-directives.module';
import { UnreleaseService } from 'app/admin/core/unrelease.service';

describe('DashboardItemComponent', () => {
  let component: LearningObjectListItemComponent;
  let fixture: ComponentFixture<LearningObjectListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [LearningObjectListItemComponent],
    imports: [
        RouterTestingModule,
        ContextMenuModule.forRoot(),
        HttpClientModule,
        CookieModule.forRoot(),
        SharedDirectivesModule
    ],
    providers: [
        { provide: AuthService, useValue: { user: new User() } },
        CollectionService,
        { provide: UnreleaseService, useClass: {} },
    ],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectListItemComponent);
    component = fixture.componentInstance;
    component.learningObject = new LearningObject();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
