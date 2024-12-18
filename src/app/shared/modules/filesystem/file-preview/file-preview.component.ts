import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AuthService } from 'app/core/auth-module/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LearningObject } from '@entity';
import { noPreview, notLoggedIn } from './file-preview.copy';

const EMPTY_URL = '';

@Component({
  selector: 'clark-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit, OnDestroy {
  @Input() file: LearningObject.Material.File;

  private isDestroyed$ = new Subject<void>();
  loggedin: boolean;
  previewUrl = EMPTY_URL;
  message = '';

  constructor(
    public auth: AuthService,
  ) {}

  ngOnInit() {
    this.previewUrl = this.file.previewUrl;
    this.copy();
    this.auth.isLoggedIn.pipe(takeUntil(this.isDestroyed$)).subscribe(val => {
      this.loggedin = val;
      this.copy();
    });
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }

  /**
   * Sets the previewUrl to its url string rather than leaving it as an empty string
   */
  get hasPreviewLink() {
    return this.previewUrl !== EMPTY_URL && this.previewUrl !== null && this.previewUrl !== undefined;
  }

  /**
   * Returns a response based on the value of the preview link on a specified file
   * and whether a user is logged in or not while attempting to preview.
   */
  copy() {
    this.message = '';
    if (!this.hasPreviewLink) {
      this.message = noPreview;
    } else if (!this.loggedin) {
      this.message = notLoggedIn;
    }
  }
}
