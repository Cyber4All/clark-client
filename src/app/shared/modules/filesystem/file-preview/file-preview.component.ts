import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AuthService } from 'app/core/auth-module/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LearningObject } from '@entity';
import { noPreview, notLoggedIn } from './file-preview.copy';
import { FileService } from 'app/core/learning-object-module/file/file.service';

@Component({
  selector: 'clark-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss'],
})
export class FilePreviewComponent implements OnInit, OnDestroy {
  @Input() file: LearningObject.Material.File;

  private isDestroyed$ = new Subject<void>();
  loggedin: boolean;
  message = '';

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.copy();
    this.auth.isLoggedIn.pipe(takeUntil(this.isDestroyed$)).subscribe((val) => {
      this.loggedin = val;
      this.copy();
    });
  }

  ngOnDestroy() {
    this.isDestroyed$.next();
    this.isDestroyed$.unsubscribe();
  }

  /**
   * Returns a response based on the value of the preview link on a specified file
   * and whether a user is logged in or not while attempting to preview.
   */
  copy() {
    this.message = '';
    if (!this.loggedin) {
      this.message = notLoggedIn;
    } else if (!FileService.canPreview(this.file.name)) {
      this.message = noPreview;
    }
  }
}
