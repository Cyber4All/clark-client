import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidePanelContentComponent } from './side-panel-content.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RatingService } from 'app/core/rating.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from 'app/core/auth.service';
import { CookieModule } from 'ngx-cookie';
import { LearningObject } from '@entity';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('SidePanelContentComponent', () => {
  let component: SidePanelContentComponent;
  let fixture: ComponentFixture<SidePanelContentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [SidePanelContentComponent],
    imports: [RouterTestingModule, HttpClientModule, CookieModule.forRoot(), NoopAnimationsModule],
    providers: [
        RatingService,
        AuthService
    ],
    teardown: { destroyAfterEach: false }
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
