import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileBrowserUtilityService } from '../file-functions';
import { LearningObject } from '@entity';

const EMPTY_URL = '';

const noPreview = 'Preview is not available for this type of file. Click the "Download Now" button located above to download this object.';
const notLoggedIn = 'Please log in to preview file. Click the "Download Now" button located above to download this object.';

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

  constructor(public auth: AuthService, private fileBrowserUtilityService: FileBrowserUtilityService) { }

  ngOnInit() {
    this.previewUrl = this.fileBrowserUtilityService.getPreviewUrl(this.file);
    this.auth.isLoggedIn.pipe(takeUntil(this.isDestroyed$)).subscribe(val => {
      this.loggedin = val;
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
    return this.previewUrl !== EMPTY_URL;
  }

/**
 * Returns a response based on the value of the preview link on a specified file
 * and whether a user is logged in or not while attempting to preview.
 */
  get copy() {
    if (!this.hasPreviewLink) {
      return noPreview;
    } else if (!this.loggedin) {
      return notLoggedIn;
    }
  }
}
