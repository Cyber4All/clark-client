import { ModalService } from '../../../../shared/modals';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../../../core/learning-object.service';
import {
  FileStorageService,
  encodeFilePath
} from '../services/file-storage.service';
import {
  DropzoneDirective,
  DropzoneConfigInterface
} from 'ngx-dropzone-wrapper';
import { TimeFunctions } from '../shared/time-functions';
import { NotificationService } from '../../../../shared/notifications';
import { environment } from '../../environments/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import {
  File,
  Material,
  FolderDescription
} from '@cyber4all/clark-entity/dist/learning-object';
import * as uuid from 'uuid';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { getPaths } from 'app/shared/filesystem/file-functions';
import { Removal } from '../../../../shared/filesystem/file-browser/file-browser.component';
import { fail } from 'assert';
type LearningObjectFile = File;

// tslint:disable-next-line:interface-over-type-literal
export type DZFile = {
  id?: string;
  accepted: boolean;
  fullPath: string;
  name: string;
  size: number;
  parent: string;
  [key: string]: any;
};

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  @ViewChild(DropzoneDirective) dzDirectiveRef: DropzoneDirective;

  private learningObjectName: string;

  private dzError = '';

  config: DropzoneConfigInterface = {
    ...environment.DROPZONE_CONFIG,
    renameFile: this.renameFile,
    params: {
      learningObjectID: ''
    },
    chunking: true,
    chunkSize: 100
  };

  files$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  folderMeta$: BehaviorSubject<FolderDescription[]> = new BehaviorSubject<
    FolderDescription[]
  >([]);
  queuedUploads$: BehaviorSubject<DZFile[]> = new BehaviorSubject<DZFile[]>([]);

  tips = TOOLTIP_TEXT;

  learningObject: LearningObject;

  uploading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  submitting = false;

  openPath: string;

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
   * Opens Dropzone upload dialog
   *
   * @memberof UploadComponent
   */
  openDZ() {
    this.dzDirectiveRef.dropzone().clickableElements[0].click();
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
      this.config.params.learningObjectID = this.learningObject.id;

      if (!this.learningObject.materials.folderDescriptions) {
        this.learningObject.materials.folderDescriptions = [];
      }
      this.updateFileSubscription();
      this.updateFolderMeta();
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
  /**
   * Updates next valid on files$
   *
   * @private
   * @memberof UploadComponent
   */
  private updateFileSubscription() {
    this.files$.next(<LearningObjectFile[]>this.learningObject.materials.files);
  }
  /**
   * Updates next value on folderMeta
   *
   * @private
   * @memberof UploadComponent
   */
  private updateFolderMeta() {
    this.folderMeta$.next(this.learningObject.materials.folderDescriptions);
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
   * @param {DZFile} file
   * @memberof UploadComponent
   */
  async addFile(file: DZFile) {
    await file;
    file = this.setFullPath(file);
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
    const queue = this.queuedUploads$.value;
    queue.push(file);
    this.queuedUploads$.next(queue);
  }
  /**
   * Checks if file as fullPath or webkitRelativePath property and sets the fullPath prop;
   *
   * @private
   * @param {DZFile} file
   * @returns
   * @memberof UploadComponent
   */
  private setFullPath(file: DZFile) {
    let path;
    if (file.fullPath || file.webkitRelativePath) {
      path = file.fullPath ? file.fullPath : file.webkitRelativePath;
    }
    if (this.openPath) {
      path = `${this.openPath}/${path ? path : file.name}`;
    }
    if (path) {
      file.fullPath = path;
    }
    return file;
  }

  /**
   * Checks if file as fullPath or webkitRelativePath property and sets the fullPath prop;
   *
   * @private
   * @param {DZFile} file
   * @returns
   * @memberof UploadComponent
   */
  private renameFile(file: any): string {
    let path: string;
    if (file.fullPath || file.webkitRelativePath) {
      path = file.fullPath ? file.fullPath : file.webkitRelativePath;
    }
    if (this.openPath) {
      path = `${this.openPath}/${path ? path : file.name}`;
    }
    if (!path) {
      path = file.name;
    }
    path = encodeFilePath(path);
    return path.trim();
  }

  onUploadSuccess($event) {
    console.log('FINISH UPLOADED: ', $event);
  }
  chunksUploaded($event) {
    console.log('CHUNKS UPLOADED: ', $event);
  }

  progress($event) {
    console.log('PROGRESS: ', $event);
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
    const queue = this.queuedUploads$.value;
    if (queue.length) {
      size +=
        queue
          .map(file => file.size)
          .reduce((total, currentSize) => total + currentSize) / BYTE_TO_MB;
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
   * Corrects malformed URLs and removes empty URLs
   *
   * @memberof UploadComponent
   */
  fixURLs() {
    for (let i = 0; i < this.learningObject.materials.urls.length; i++) {
      const url = this.learningObject.materials.urls[i];
      if (!url.title || !url.url) {
        this.removeURL(i);
      } else if (!url.url.match(/https?:\/\/.+/i)) {
        url.url = `http://${url.url}`;
        this.learningObject.materials.urls[i] = url;
      }
    }
  }
  /**
   * Check to see if file exists in array of Learning Object Material Files
   * If exists update else add
   *
   * @param {LearningObjectFile[]} loFiles
   * @memberof UploadComponent
   */
  updateFiles(loFiles: LearningObjectFile[]) {
    for (const newFile of loFiles) {
      for (let i = 0; i < this.learningObject.materials.files.length; i++) {
        const oldFile = this.learningObject.materials.files[i];
        if (newFile.url === oldFile.url) {
          newFile.description = oldFile.description;
          this.learningObject.materials.files[i] = newFile;
          loFiles.pop();
        }
      }
    }
    this.learningObject.materials.files = [
      ...loFiles,
      ...this.learningObject.materials.files
    ];
  }

  /**
   * On submission, if there are scheduled deletions files within scheduled deletions get deleted
   * any added files get uploaded, then learning object is updated and user is navigated to
   * content view.
   *
   * @memberof UploadComponent
   */
  async save(stayOnPage?: boolean) {
    try {
      this.submitting = true;

      const learningObjectFiles = await this.upload();

      this.uploading$.next(false);

      this.submitting = false;

      this.updateFiles(learningObjectFiles);

      this.fixURLs();
      try {
        await this.learningObjectService.save(this.learningObject);
        this.submitting = false;
        this.uploading$.next(false);
        this.updateFileSubscription();
        if (!stayOnPage) {
          this.router.navigate(['/onion/dashboard']);
        }
      } catch (e) {
        this.submitting = false;
        this.uploading$.next(false);
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
      this.uploading$.next(false);
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
    const queue = this.queuedUploads$.value;

    if (queue.length >= 1) {
      this.uploading$.next(true);
      const failed: DZFile[] = [];

      const uploaded: LearningObjectFile[] = await Promise.all(
        queue.map((file, index) =>
          this.fileStorageService
            .upload(this.learningObject, file)
            .then(loFile => {
              queue.splice(index, 1);
              this.queuedUploads$.next(queue);
              return loFile;
            })
            .catch(e => {
              file.status = 'failed';
              failed.push(file);
              return null;
            })
        )
      )
        .then(files => files.filter(obj => obj))
        .catch(e => {
          console.log(e);
          return null;
        });

      this.queuedUploads$.next(failed ? failed : []);

      return uploaded;
    }
    this.uploading$.next(false);
    return Promise.resolve([]);
  }

  /**
   * Sends a list of files to API for deletion & Updates learning object
   *
   * @returns {Promise<void>}
   * @memberof UploadComponent
   */
  async handleDeletion(params: {
    files: string[];
    removal: Removal;
  }): Promise<void> {
    try {
      if (params.removal.type === 'folder') {
        const index = this.findFolder(params.removal.path);
        (<any[]>this.learningObject.materials.folderDescriptions).splice(
          index,
          1
        );
      }
      await this.deleteFromMaterials(params.files);
      this.deleteFiles(params.files);
      this.updateFileSubscription();
    } catch (e) {
      console.log(e);
    }
  }
  /**
   * Adds description to file or folderMeat
   *
   * @param {any} file
   * @returns {Promise<void>}
   * @memberof UploadComponent
   */
  async handleEdit(file: LearningObjectFile | any): Promise<void> {
    try {
      if (!file.isFolder) {
        const index = this.findFile(file.path);
        this.learningObject.materials.files[index].description =
          file.description;
        this.updateFileSubscription();
      } else {
        const index = this.findFolder(file.path);
        if (index > -1) {
          this.learningObject.materials.folderDescriptions[index].description =
            file.description;
        } else {
          const folderDescription = {
            path: file.path,
            description: file.description
          };
          this.learningObject.materials.folderDescriptions.push(
            folderDescription
          );
        }
        this.updateFolderMeta();
      }
      await this.learningObjectService.save(this.learningObject);
    } catch (e) {
      console.log(e);
    }
  }
  /**
   * Deletes file from materials
   *
   * @private
   * @param {string[]} paths
   * @returns {Promise<any>}
   * @memberof UploadComponent
   */
  private deleteFromMaterials(paths: string[]): Promise<any> {
    for (const path of paths) {
      const index = this.findFile(path);
      this.learningObject.materials.files.splice(index, 1);
    }
    return this.learningObjectService.save(this.learningObject);
  }
  /**
   * Deletes file from S3
   *
   * @private
   * @param {string[]} files
   * @memberof UploadComponent
   */
  private deleteFiles(files: string[]) {
    for (const file of files) {
      this.fileStorageService.delete(this.learningObject, file);
    }
  }
  /**
   * Finds index of file
   *
   * @private
   * @param {string} path
   * @returns {number}
   * @memberof UploadComponent
   */
  private findFile(path: string): number {
    let index = -1;
    const files = this.learningObject.materials.files;
    for (let i = 0; i < files.length; i++) {
      const filePath = files[i]['fullPath']
        ? files[i]['fullPath']
        : files[i].name;
      if (filePath === path) {
        index = i;
        break;
      }
    }
    return index;
  }
  /**
   * Finds index of folder
   *
   * @private
   * @param {string} path
   * @returns {number}
   * @memberof UploadComponent
   */
  private findFolder(path: string): number {
    let index = -1;
    const folders = this.learningObject.materials.folderDescriptions;
    for (let i = 0; i < folders.length; i++) {
      const folderPath = folders[i].path;
      if (folderPath === path) {
        index = i;
        break;
      }
    }
    return index;
  }
  /**
   * Generates UUID
   *
   * @private
   * @returns {string}
   * @memberof UploadComponent
   */
  private getUUID(): string {
    return uuid.v1();
  }
}
