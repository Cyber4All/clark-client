import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningObjectsComponent } from './learning-objects.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { AuthService } from 'app/core/auth.service';
import { CollectionService } from 'app/core/collection.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('LearningObjectsComponent', () => {
  let component: LearningObjectsComponent;
  let fixture: ComponentFixture<LearningObjectsComponent>;

  class ActivatedRouteStub {
    public parent = {
      params: of({})
    };

    public queryParams = of({});
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ LearningObjectsComponent ],
      imports: [ RouterTestingModule, HttpClientModule, CookieModule.forRoot() ],
      providers: [
        ToastrOvenService,
        AuthService,
        CollectionService,
        { provide: ActivatedRoute, useClass: ActivatedRouteStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningObjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
