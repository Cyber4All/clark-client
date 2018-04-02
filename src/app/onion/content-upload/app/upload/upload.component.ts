import { ModalService } from '../../../../shared/modals';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../../../core/learning-object.service';
import { FileStorageService } from '../services/file-storage.service';
import { DropzoneDirective } from 'ngx-dropzone-wrapper';
import { TimeFunctions } from '../time-functions';
import { NotificationService } from '../../../../shared/notifications';
import { DirectoryTree, LearningObjectFile } from '../DirectoryTree';
import { environment } from '../../environments/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { getPaths } from '../file-functions';

import * as uuid from 'uuid';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: [
    '../../styles.css',
    './upload.component.scss',
    '../../dropzone.scss'
  ]
})
export class UploadComponent implements OnInit {
  @ViewChild(DropzoneDirective) dzDirectiveRef: DropzoneDirective;
  files$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  queuedUploads$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  public tips = TOOLTIP_TEXT;

  private filePathMap: Map<string, string> = new Map<string, string>();

  currentFolder: string;

  private learningObjectName: string;

  learningObject: LearningObject = new LearningObject(null, '');

  scheduledDeletions: {}[] = [];
  uploading: boolean = false;
  submitting: boolean = false;

  file_descriptions: Map<string, string> = new Map();

  private dzError: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private learningObjectService: LearningObjectService,
    private fileStorageService: FileStorageService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.learningObjectName = this.route.snapshot.params.learningObjectName;
    this.learningObjectName
      ? this.fetchLearningObject()
      : this.router.navigate(['/onion/dashboard']);
  }

  /**
   * Fetches Learning Object by name
   *
   * @private
   * @memberof ViewComponent
   */
  private async fetchLearningObject() {
    try {
      this.learningObject = await this.learningObjectService.getLearningObject(
        this.learningObjectName
      );
      // FIXME: Update typing in entity package and remove type casting
      this.updateFileSubscription();
      this.watchTimestamps();
    } catch (e) {
      this.notificationService.notify(
        `Could not fetch Learning Object`,
        `${e}`,
        `bad`,
        ``
      );
    }
  }
  private updateFileSubscription() {
    this.files$.next(<LearningObjectFile[]>this.learningObject.materials.files);
  }

  /**
   * Adds a human readable representation of time elapsed since file was added
   *
   * @private
   * @memberof ViewComponent
   */
  private watchTimestamps() {
    let interval = 1000;
    const MINUTE = 60000;
    setInterval(() => {
      // After initial pass only update every minute
      interval = MINUTE;
      this.learningObject.materials.files.map(file => {
        file['timeAgo'] = TimeFunctions.getTimestampAge(+file.date);
        return file;
      });
    }, interval);
  }
  /**
   * Fired when file is added. Verifies limit hasn't been reached and adds to queued files & filesystem
   *
   * @param {File} file
   * @memberof UploadComponent
   */
  async addFile(file) {
    await file;
    if (!file.accepted) {
      this.dzError = 'File not accepted';
      this.showFileError(file.name);
      return;
    }
    const pastFileLimit = this.pastFileLimit(file.size);
    if (pastFileLimit) {
      this.showFileError(file.name);
      return;
    }
    file.id = this.getUUID();
    const isFolder = this.isFolder(file);
    if (isFolder) this.mapToPath(file);
    const queue = this.queuedUploads$.getValue();
    queue.push(file);
    this.queuedUploads$.next(queue);
  }

  /**
   * Check upload is folder or not
   *
   * @param {File} file
   * @returns {boolean}
   * @memberof UploadComponent
   */
  private isFolder(file: File): boolean {
    if (!file.fullPath) return false;
    const paths: string[] = getPaths(file.fullPath);
    if (paths.length > 0) return true;
    return false;
  }

  private mapToPath(file) {
    const path = getPaths(file.fullPath).join('/');
    this.filePathMap.set(file.id, path);
  }

  /**
   * Displays error via notification service
   *
   * @private
   * @param {string} name
   * @memberof UploadComponent
   */
  private showFileError(name: string) {
    this.notificationService.notify(
      `${name} could not be added`,
      this.dzError,
      'bad',
      ''
    );
  }

  /**
   * Checks if user has reached upload size limit
   *
   * @private
   * @param {number} addedSize
   * @returns
   * @memberof UploadComponent
   */
  private pastFileLimit(addedSize: number) {
    const BYTE_TO_MB = 1000000;
    let size = addedSize / BYTE_TO_MB;
    const queue = this.queuedUploads$.getValue();
    if (queue.length) {
      size +=
        queue.map(file => file.size).reduce((total, size) => total + size) /
        BYTE_TO_MB;
    }
    if (size > environment.DROPZONE_CONFIG.maxFilesize) {
      this.dzError = `Exceeded max upload size of ${
        environment.DROPZONE_CONFIG.maxFilesize
      }mb`;
      return true;
    }

    return false;
  }

  /**
   * Adds files to scheduled deletion array and removes
   * from learning object repository files
   *
   * @param {any} file
   * @param {number} index
   * @memberof UploadComponent
   */
  markForDeletion(file, index: number) {
    this.scheduledDeletions.push(file);
    this.learningObject.materials.files.splice(index, 1);
  }

  /**
   * Adds a link to learning object repository URLs
   *
   * @memberof UploadComponent
   */
  addURL() {
    this.learningObject.materials.urls.push({ title: '', url: '' });
  }

  /**
   * Removes a link from learning object repository URLs
   *
   * @param {any} index
   * @returns
   * @memberof UploadComponent
   */
  removeURL(index) {
    if (this.learningObject.materials.urls.length > 0) {
      return this.learningObject.materials.urls.splice(index, 1);
    }
    return null;
  }
  /**
   * Corrects malfored URLs and removes empty URLs
   *
   * @memberof UploadComponent
   */
  fixURLs() {
    for (let i = 0; i < this.learningObject.materials.urls.length; i++) {
      let url = this.learningObject.materials.urls[i];
      if (!url.title || !url.url) {
        this.removeURL(i);
      } else if (!url.url.match(/https?:\/\/.+/i)) {
        url.url = `http://${url.url}`;
        this.learningObject.materials.urls[i] = url;
      }
    }
  }

  /**
   * On submission, if there are scheduled deletions files within scheduled deletions get deleted
   * any added files get uploaded, then learning object is updated and user is navigated to
   * content view.
   *
   * @memberof UploadComponent
   */
  async save() {
    try {
      this.submitting = true;
      if (this.scheduledDeletions.length > 0) {
        await this.deleteFiles();
      }

      let learningObjectFiles = await this.upload();

      this.uploading = false;

      this.submitting = false;

      this.learningObject.materials.files = [
        ...this.learningObject.materials.files,
        ...(<any>learningObjectFiles)
      ];
      this.fixURLs();
      try {
        await this.learningObjectService.save(this.learningObject);
        this.submitting = false;
        this.uploading = false;
        this.updateFileSubscription();
      } catch (e) {
        this.submitting = false;
        this.uploading = false;
        this.notificationService.notify(
          'Could not update your materials.',
          `${e}`,
          'bad',
          'far fa-times'
        );
      }
    } catch (e) {
      console.log(e);
      this.submitting = false;
      this.uploading = false;
      this.notificationService.notify(
        'Could not upload your materials.',
        `${e}`,
        'bad',
        'far fa-times'
      );
    }
  }

  /**
   * Sends files to API to be uploaded to S3
   * and returns an array of learning object files.
   *
   * @returns {Promise<LearningObjectFile[]>}
   * @memberof UploadComponent
   */
  async upload(): Promise<LearningObjectFile[]> {
    const queue = this.queuedUploads$.getValue();
    if (queue.length >= 1) {
      // this.mapFileDescriptions();
      this.uploading = true;
      let learningObjectFiles = await this.fileStorageService.upload(
        this.learningObject,
        queue,
        this.filePathMap
      );
      this.queuedUploads$.next([]);
      // for (let i = 0; i < learningObjectFiles.length; i++) {
      //   learningObjectFiles[i]['description'] = this.file_descriptions.get(
      //     learningObjectFiles[i]['id']
      //   );
      // }

      return learningObjectFiles;
    }
    this.uploading = false;
    return Promise.resolve([]);
  }
  /**
   * Maps Learning Object Files to their descriptions
   *
   * @private
   * @returns
   * @memberof UploadComponent
   */
  private mapFileDescriptions() {
    const queue = this.queuedUploads$.getValue();
    for (let file of queue) {
      this.file_descriptions.set(file.id, file.description);
    }
  }

  /**
   * Sends a list of files to API for deletion
   *
   * @returns {Promise<{}[]>}
   * @memberof UploadComponent
   */
  deleteFiles(): Promise<{}[]> {
    return Promise.all(
      this.scheduledDeletions.map(file => {
        return new Promise((resolve, reject) => {
          this.fileStorageService
            .delete(this.learningObject, file['name'])
            .then(() => {
              resolve('Deleted');
            });
        });
      })
    );
  }

  private getUUID(): string {
    return uuid.v1();
  }
}

export type File = {
  id?: string;
  accepted: boolean;
  fullPath: string;
  name: string;
  size: number;
  parent: string;
  [key: string]: any;
};
