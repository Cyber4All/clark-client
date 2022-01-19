/* eslint-disable @typescript-eslint/naming-convention */
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilePreviewComponent } from './file-preview.component';
import { noPreview, notLoggedIn } from './file-preview.copy';
import { AuthService } from 'app/core/auth.service';
import { BehaviorSubject } from 'rxjs';

describe('FilePreviewComponent', () => {
  let component: FilePreviewComponent;
  let fixture: ComponentFixture<FilePreviewComponent>;
  const AuthServiceStub = {
    isLoggedIn: new BehaviorSubject(false)
  };


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: AuthServiceStub },
      ],
      declarations: [FilePreviewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hasPreviewLink', () => {
    it('should have a preview link when the previewUrl is not empty', () => {
      component.previewUrl = 'https://clark.center';
      expect(component.hasPreviewLink).toBeTruthy();
    });

    it('should not have a preview link when the previewUrl is empty', () => {
      expect(component.hasPreviewLink).toBeFalsy();
    });
    describe('when the user is logged in', () => {
      describe('and it has an empty previewUrl', () => {
        it('should return the noPreview response', () => {
          expect(component.copy).toBe(noPreview);
        });
      });
    });

    describe('when the user is not logged in', () => {
      describe('and it has an empty previewUrl', () => {
        it('should return the noPreview response', () => {
          expect(component.copy).toBe(noPreview);
        });
      });

      describe('and it has a non-empty previewUrl', () => {
        it('should return the notLoggedIn response', () => {
          component.previewUrl = 'https://clark.center';
          expect(component.copy).toBe(notLoggedIn);
        });
      });
    });
  });
});
