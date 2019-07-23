import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidePanelContentComponent } from './side-panel-content.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TooltipModule } from 'app/shared/Shared Modules/tooltips/tip.module';
import { RatingService } from 'app/core/rating.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from 'app/core/auth.service';
import { CookieModule } from 'ngx-cookie';
import { LearningObject } from '@entity';

describe('SidePanelContentComponent', () => {
  let component: SidePanelContentComponent;
  let fixture: ComponentFixture<SidePanelContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ SidePanelContentComponent ],
      imports: [ RouterTestingModule, TooltipModule, HttpClientModule, CookieModule.forRoot() ],
      providers: [
        RatingService,
        AuthService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidePanelContentComponent);
    component = fixture.componentInstance;
    component.learningObject = new LearningObject();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
