
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSearchComponent } from './filter-search.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CollectionService } from 'app/core/collection-module/collections.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService } from 'app/core/auth-module/auth.service';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';

describe('SearchBarComponent', () => {
  let component: FilterSearchComponent;
  let fixture: ComponentFixture<FilterSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [FilterSearchComponent],
      teardown: { destroyAfterEach: false },
      providers: [
        { provide: AuthService, useValue: { user: { accessGroups: [] } } },
        CollectionService,
        ToastrOvenService,
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
