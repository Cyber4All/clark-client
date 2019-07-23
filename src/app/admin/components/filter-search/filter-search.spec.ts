
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSearchComponent } from './filter-search.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CollectionService } from 'app/core/collection.service';
import { HttpClientModule } from '@angular/common/http';
import { CookieModule } from 'ngx-cookie';
import { AuthService } from 'app/core/auth.service';
import { ToasterService } from 'app/shared/Shared Modules/toaster';

describe('SearchBarComponent', () => {
  let component: FilterSearchComponent;
  let fixture: ComponentFixture<FilterSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ FilterSearchComponent ],
      imports: [ HttpClientModule, CookieModule.forRoot() ],
      providers: [
        { provide: AuthService, useValue: { user: { accessGroups: [] } } },
        CollectionService,
        ToasterService
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
