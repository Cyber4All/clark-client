import { takeUntil, debounceTime, take } from 'rxjs/operators';
import { trigger, style, animate, transition } from '@angular/animations';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { LearningObject } from '@entity';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';

import { FileManagementService } from '../services/file-management.service';
import { LEGACY_PUBLIC_LEARNING_OBJECT_ROUTES } from '../../../../../../core/learning-object-module/learning-object/learning-object.routes';
import {
  FileUploadMeta,
  UploadErrorReason,
  UploadUpdate,
  UploadProgressUpdate,
  UploadCompleteUpdate,
  UploadQueueCompleteUpdate,
  UploadErrorUpdate,
} from '../services/typings';
import { UPLOAD_ERRORS } from './errors';
import { AuthService } from 'app/core/auth-module/auth.service';
import { getUserAgentBrowser } from 'getUserAgentBrowser';
import { DirectoryNode } from 'app/shared/modules/filesystem/DirectoryNode';
import { HttpErrorResponse } from '@angular/common/http';
import { FILE_ROUTES } from 'app/core/learning-object-module/file/file.routes';

export interface FileInput extends File {
  fullPath?: string;
  webkitRelativePath: string;
}

export interface EnqueuedFile extends FileInput {
  progress?: number;
  success?: boolean;
  totalUploaded?: number;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms', style({ opacity: 1 })),
      ]),
    ]),
    trigger('uploadQueue', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate(
          '200ms 200ms ease-out',
          style({ transform: 'translateY(0px)', opacity: 1 }),
        ),
      ]),
      transition(':leave', [
        style({ transform: 'translateY(-0px)', opacity: 1 }),
        animate(
          '200ms ease-out',
          style({ transform: 'translateY(20px)', opacity: 0 }),
        ),
      ]),
    ]),
  ],
})
export class UploadComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('folderInput') folderInput: ElementRef;

  @Input()
  error$: Subject<string> = new Subject<string>();
  @Input()
  saving$: Subject<boolean> = new Subject<boolean>();
  @Input()
  learningObject$: Observable<LearningObject> =
    new Observable<LearningObject>();

  @Output()
  filesDeleted: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output()
  filesUploaded: EventEmitter<FileUploadMeta[]> = new EventEmitter<
    FileUploadMeta[]
  >();
  @Output()
  uploadComplete: EventEmitter<string> = new EventEmitter<string>(true);
  @Output()
  urlAdded: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  urlUpdated: EventEmitter<{
    index: string;
    url: LearningObject.Material.Url;
  }> = new EventEmitter<{
    index: string;
    url: LearningObject.Material.Url;
  }>();
  @Output()
  urlRemoved: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  fileDescriptionUpdated: EventEmitter<{
    id: string;
    description: string;
  }> = new EventEmitter<{ id: string; description: string }>();
  @Output()
  folderDescriptionUpdated: EventEmitter<{
    path?: string;
    index?: number;
    description: string;
  }> = new EventEmitter<{ index: number; description: string }>();
  @Output()
  notesUpdated: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  packageableToggled: EventEmitter<{
    state: boolean;
    item: DirectoryNode | LearningObject.Material.File;
  }> = new EventEmitter();

  notes$: Subject<string> = new Subject<string>();

  slide = 1;
  animationDirection: 'prev' | 'next' = 'next';
  showDragMenu = false;
  dropped = false;

  retrieving = false;

  files$: BehaviorSubject<LearningObject.Material.File[]> = new BehaviorSubject<
    LearningObject.Material.File[]
  >([]);
  folderMeta$: BehaviorSubject<LearningObject.Material.FolderDescription[]> =
    new BehaviorSubject<LearningObject.Material.FolderDescription[]>([]);

  uploadQueue: EnqueuedFile[] = [];
  uploadQueueMap: { [path: string]: number } = {};
  uploadProgress = 0;

  totalUploaded = 0;
  totalUploadSize = 0;

  tips = TOOLTIP_TEXT;

  unsubscribe$ = new Subject<void>();

  openPath: string;

  notes: string;

  solutionUpload = false;

  showDeletePopup = false;
  handleDeleteGenerator: Iterator<void, any, boolean>;

  dragAndDropSupported = false;

  learningObjectCuid: string;

  private bucketUploadPath = '';

  private newFileMeta: FileUploadMeta[] = [];

  private credentialRefreshAttempted = false;

  constructor(
    private notificationService: ToastrOvenService,
    private changeDetector: ChangeDetectorRef,
    private fileManager: FileManagementService,
    private auth: AuthService,
  ) {
    this.checkDragDropSupport();
  }

  /**
   * Checks if the user's browser is one that will support drag and drop uploads by checking the user agent
   *
   * @memberof UploadComponent
   */
  checkDragDropSupport() {
    const supportedBrowserRegex = /chrome|firefox/gi;
    const browser = getUserAgentBrowser();
    if (supportedBrowserRegex.test(browser)) {
      this.dragAndDropSupported = true;
    }
  }

  ngOnInit() {
    this.learningObject$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((object) => {
        if (object) {
          this.learningObjectCuid = object.cuid;
          this.notes = object.materials.notes;
          this.bucketUploadPath = `${object.author.username}/${object._id}`;
          this.files$.next(object.materials.files);
          this.folderMeta$.next(object.materials.folderDescriptions);
          this.solutionUpload = false;
          this.files$.value.forEach((file) => {
            if (file.name.toLowerCase().indexOf('solution') >= 0) {
              this.solutionUpload = true;
            }
          });
        }
      });
    this.notes$
      .pipe(takeUntil(this.unsubscribe$), debounceTime(650))
      .subscribe((notes) => {
        this.notesUpdated.emit(notes);
      });

    this.error$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((err: Error | string | HttpErrorResponse) => {
        let message: string;
        if (err) {
          if (err instanceof Error) {
            message = err.message;
          } else if (err instanceof HttpErrorResponse) {
            message = err.error.message;
          } else {
            message = err;
          }
          this.notificationService.error('Error!', message);
        }
      });
  }

  ngAfterViewInit() {
    // create an observable from the dragover event and subscribe to it to show the dropzone popover
    fromEvent(document.getElementsByTagName('body')[0], 'dragover')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: any) => {
        const validDrop = Array.prototype.every.call(
          event.dataTransfer.items,
          (item) => item.kind === 'file',
        );
        this.toggleDrag(validDrop);
      });

    // create an observable from the dragover event and subscribe to it to show the dropzone popover
    fromEvent(document.getElementsByTagName('body')[0], 'dragleave')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: any) => {
        if (event.target && event.target.classList.contains('uploader')) {
          this.toggleDrag(false);
        }
      });
  }

  /**
   * Change and animate a new slide onto the screen
   *
   * @param index number corresponding to the new slide to be rendered
   */
  changeSlide(index: number) {
    if (index !== this.slide) {
      this.animationDirection = index < this.slide ? 'prev' : 'next';
      this.changeDetector.detectChanges();
    }
    this.slide = index;
  }

  /**
   * Toggle dropzone popover
   *
   * @param val boolean, if true show popover, if false hide it
   * @param delay number of milliseconds to delay action
   */
  toggleDrag(val: boolean, delay: number = 0) {
    setTimeout(() => {
      this.showDragMenu = val;
    }, delay);
  }

  /**
   * Adds the dropped class to the uploader popup to animate the arrow. Removed after delay
   *
   * @param val boolean, if true set dropped to true and set timeout to remove it
   * @param delay number of milliseconds to delay before removing
   */
  toggleDropped(val: boolean, delay: number = 1200) {
    if (val) {
      setTimeout(() => {
        this.dropped = false;
      }, delay);
    }

    this.dropped = val;
  }

  /**
   * Handles dragenter event and Allows valid drop data
   *
   * @param {DragEvent} event [Drag event]
   * @returns
   * @memberof UploadComponent
   */
  dragenter(event: DragEvent) {
    // indicates valid drop data
    // false allows drop
    return Array.prototype.every.call(
      event.dataTransfer.items,
      (item) => item.kind !== 'file',
    );
  }
  /**
   * Handles dragover event and Allows valid drop data
   *
   * @param {DragEvent} event [Drag event]
   * @returns
   * @memberof UploadComponent
   */
  dragover(event: DragEvent) {
    // indicates valid drop data
    // false allows drop
    return Array.prototype.every.call(
      event.dataTransfer.items,
      (item) => item.kind !== 'file',
    );
  }

  /**
   * Handles drop event by filtering data transfer items to files; Parsing folder and file entries; Starting upload
   *
   * @param {DragEvent} event [Drag event]
   * @memberof UploadComponent
   */
  async handleDrop(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.toggleDrag(false, 300);
    this.toggleDropped(true);
    const entries = Array.from(event.dataTransfer.items)
      .filter((item: any) => item.kind === 'file')
      .map((item: any) => item.webkitGetAsEntry());
    const files = await this.parseFilesFromEntry({
      entries,
      currentDirPath: '',
    });
    this.handleUpload(files);
  }

  /**
   * Parses file entry using entry's file method.
   * Promise is rejected if file is invalid
   *
   * @private
   * @param {*} fileEntry
   * @returns {Promise<FileInput>}
   * @memberof UploadComponent
   */
  private parseFileEntry(fileEntry): Promise<FileInput> {
    return new Promise((resolve, reject) => {
      fileEntry.file(
        (file) => {
          resolve(file);
        },
        (err) => {
          reject(err);
        },
      );
    });
  }

  /**
   * Recursively parses directory entry using reader to get files
   * Concats directory paths to form file path
   *
   * @private
   * @param {any} directoryEntry
   * @param {string} currentDirPath
   * @returns {Promise<FileInput[]>}
   * @memberof UploadComponent
   */
  private parseDirectoryEntry({
    directoryEntry,
    currentDirPath,
  }: {
    directoryEntry: any;
    currentDirPath: string;
  }): Promise<FileInput[]> {
    const directoryReader = directoryEntry.createReader();
    return new Promise((resolve, reject) => {
      directoryReader.readEntries(
        (entries) => {
          const newPath =
            `${currentDirPath ? currentDirPath + '/' : ''}` +
            directoryEntry.name;
          this.parseFilesFromEntry({
            entries,
            currentDirPath: newPath,
          }).then((files) => {
            resolve(files);
          });
        },
        (err) => {
          reject(err);
        },
      );
    });
  }

  /**
   * Parses file list of entries
   * `currentDirPath` and `openPath` are appended to the file's path if they are set
   *
   * @private
   * @param {any[]} entries
   * @param {string} currentDirPath
   * @returns {Promise<FileInput[]>}
   * @memberof UploadComponent
   */
  private parseFilesFromEntry({
    entries,
    currentDirPath,
  }: {
    entries: any[];
    currentDirPath: string;
  }): Promise<FileInput[]> {
    const files = [];
    const promises$ = entries.map((entry) => {
      if (entry.isFile) {
        return this.parseFileEntry(entry).then((file) => {
          if (currentDirPath) {
            file.fullPath = `${currentDirPath}/${file.name}`;
          }
          if (this.openPath) {
            file.fullPath = `${this.openPath}/${file.fullPath || file.name}`;
          }
          files.push(file);
        });
      } else if (entry.isDirectory) {
        return this.parseDirectoryEntry({
          currentDirPath,
          directoryEntry: entry,
        }).then((allFiles) => {
          files.push(...allFiles);
        });
      }
    });
    return Promise.all(promises$).then(() => files);
  }

  /**
   * Opens file upload dialog
   *
   * @memberof UploadComponent
   */
  openFilePicker(folderPicker: boolean) {
    this.uploadComplete.next('false');
    if (folderPicker) {
      this.folderInput.nativeElement.click();
      this.uploadComplete.next(undefined);
    } else {
      this.fileInput.nativeElement.click();
      this.uploadComplete.next(undefined);
    }
  }

  /**
   * Files when files or folders are selected via picker
   * Grabs all files from FileList and starts upload
   *
   * @param {FileList} fileList
   * @memberof UploadComponent
   */
  filesPicked(fileList: FileList) {
    if (fileList.length > 0) {
      this.uploadComplete.emit('false');
      let files: FileInput[] = Array.from(fileList);
      if (this.openPath) {
        files = files.map((file) => {
          file.fullPath = `${this.openPath}/${
            file.webkitRelativePath || file.name
          }`;
          return file;
        });
      }
      this.handleUpload(files);
    }
  }

  /**
   * Handles file uploads by storing files in upload queue and uploading using the file manager
   *
   * @private
   * @param {FileInput[]} files [List of files to enqueue and upload]
   * @memberof UploadComponent
   */
  private async handleUpload(files: FileInput[]) {
    this.uploadComplete.emit('false');
    this.enqueueFiles(files);
    try {
      const learningObject = await this.learningObject$
        .pipe(take(1))
        .toPromise();
      this.fileManager
        .upload({
          authorUsername: learningObject.author.username,
          learningObjectCuid: learningObject.cuid,
          learningObjectRevisionId: learningObject.version,
          files,
        })
        .subscribe((update) => this.handleUploadUpdates(update));
    } catch (e) {
      console.error('UPLOAD ERROR', e);
      if (e.name === UploadErrorReason.Credentials) {
        this.handleCredentialsError();
      } else {
        this.error$.next(UPLOAD_ERRORS.SERVICE_ERROR);
      }
      throw e;
    }
  }

  /**
   * Adds files to queue and caches their indexes
   *
   * @private
   * @param {FileInput[]} files [List of files to enqueue]
   * @memberof UploadComponent
   */
  private enqueueFiles(files: FileInput[]) {
    files.forEach((file) => {
      if (file.name !== `${this.learningObjectCuid}.zip`) {
        const path = file.fullPath || file.webkitRelativePath || file.name;
        this.uploadQueueMap[path] = this.uploadQueue.length;
        this.uploadQueue.push(file);
        this.totalUploadSize += file.size;
      }
    });
  }

  /**
   * Resets all upload status trackers
   *
   * @private
   * @memberof UploadComponent
   */
  private resetUploadStatuses() {
    this.uploadQueue = [];
    this.uploadQueueMap = {};
    this.uploadProgress = 0;
    this.totalUploaded = 0;
    this.totalUploadSize = 0;
    this.folderInput.nativeElement.value = null;
    this.fileInput.nativeElement.value = null;
    this.uploadComplete.emit('true');
  }

  /**
   * Handles delegation of handling UploadUpdates
   *
   * @private
   * @param {UploadUpdate} update [Upload update object from the file manager]
   * @memberof UploadComponent
   */
  private handleUploadUpdates(update: UploadUpdate) {
    switch (update.type) {
      case 'progress':
        this.updateUploadProgress(update as UploadProgressUpdate);
        break;
      case 'complete':
        this.handleFileUploadComplete(update as UploadCompleteUpdate);
        break;
      case 'queueComplete':
        this.handleQueueComplete(update as UploadQueueCompleteUpdate);
        break;
      case 'error':
        this.handleUploadError(update as UploadErrorUpdate);
        break;
      default:
        break;
    }
  }

  /**
   * Handles updating the total upload progress which is calculated by (totalDataUploaded/totalUploadSize)
   * Last totalUploaded is subtracted from the update's progress to remove what has already been added to the totalUploaded value
   * Example:
   * `totalUploaded` = 2 units; `lastTotalUploaded` = 2 units; `upload.data.totalUploaded` = 10 units; `totalUploadSize`= 100 units;
   * `totalUploaded`+= `upload.data.totalUploaded` - `lastTotalUploaded` = 2+10-2 = 10 units uploaded
   * `uploadProgress` = (`totalUploaded`/`totalUploadSize`) * 100 = (10 units/100 units) * 100 = .10 * 100 = 10%
   *
   * @private
   * @param {UploadProgressUpdate} update [Progress update object from file manager]
   * @memberof UploadComponent
   */
  private updateUploadProgress(update: UploadProgressUpdate) {
    const index = this.uploadQueueMap[update.data.fullPath];
    const lastTotalUploaded = this.uploadQueue[index].totalUploaded || 0;
    this.uploadQueue[index].totalUploaded = update.data.totalUploaded;
    this.totalUploaded += update.data.totalUploaded - lastTotalUploaded;
    this.uploadProgress = (this.totalUploaded / this.totalUploadSize) * 100;
  }

  /**
   * Handles completion of a file upload by setting it's success flag to true and adding its metadata to the new file meta list
   *
   * @private
   * @param {UploadCompleteUpdate} update [Upload Complete update object from file manager]
   * @memberof UploadComponent
   */
  private handleFileUploadComplete(update: UploadCompleteUpdate) {
    const index = this.uploadQueueMap[update.data.fullPath];
    this.uploadQueue[index].success = true;
    this.newFileMeta.push(update.data);
  }

  /**
   * Handles completion of the upload queue.
   * If no files failed; Upload progress is set to 100 just in case the progress updates didn't reflect this;
   * Upload statuses are reset after brief timeout to allow user to see the completion
   *
   * If files failed; Un-uploaded files are retrieved from the queue; An error message is sent to the user; Upload statuses are reset
   *
   * @private
   * @param {UploadQueueCompleteUpdate} update [Queue Complete update object from file manager]
   * @memberof UploadComponent
   */
  private handleQueueComplete(update: UploadQueueCompleteUpdate) {
    if ((update as UploadQueueCompleteUpdate).data.failed) {
      const unUploadedFiles = this.uploadQueue.filter((file) => !file.success);
      const fileNames = unUploadedFiles.map((file) => file.name).join(', ');
      this.error$.next(UPLOAD_ERRORS.FILES_FAILED(fileNames));
      // TODO: Prompt user and Attempt retry?
      this.resetUploadStatuses();
    } else {
      this.uploadProgress = 100;
      setTimeout(() => {
        this.resetUploadStatuses();
      }, 500);
    }
    this.filesUploaded.emit(this.newFileMeta);
    this.uploadComplete.emit('true');
    this.newFileMeta = [];
  }

  /**
   * Handles file upload errors by marking the file success flag as false
   *
   * @private
   * @param {UploadErrorUpdate} update [Upload Error update object from file manager]
   * @memberof UploadComponent
   */
  private handleUploadError(update: UploadErrorUpdate) {
    if (update.error.name === UploadErrorReason.Credentials) {
      this.handleCredentialsError();
    } else {
      const index = this.uploadQueueMap[update.data.fullPath];
      this.uploadQueue[index].success = false;
    }
  }

  private handleCredentialsError() {
    if (!this.credentialRefreshAttempted) {
      this.credentialRefreshAttempted = true;
      this.auth
        .refreshToken()
        .then(() => {
          const failedFiles = this.uploadQueue.filter((file) => !file.success);
          this.resetUploadStatuses();
          this.handleUpload(failedFiles);
        })
        .catch((e) => {
          this.resetUploadStatuses();
          this.error$.next(UPLOAD_ERRORS.INVALID_CREDENTIALS);
        });
    } else {
      this.resetUploadStatuses();
      this.error$.next(UPLOAD_ERRORS.INVALID_CREDENTIALS);
    }
  }

  /**
   * Handles downloading a file by opening the stream url in a new window
   *
   * @param {LearningObject.Material.File} file[The file to be downloaded]
   * @memberof UploadComponent
   */
  async handleFileDownload(file: LearningObject.Material.File) {
    const learningObject = await this.learningObject$.pipe(take(1)).toPromise();
    const loId = learningObject._id;
    const url = FILE_ROUTES.DOWNLOAD_FILE(loId, file._id);
    window.open(url, '__blank');
  }

  /**
   * Adds a link to learning object repository URLs
   *
   * @memberof UploadComponent
   */
  addURL() {
    this.urlAdded.emit();
  }

  /**
   * Emits url updates
   *
   * @memberof UploadComponent
   */
  updateUrl(data: { index: string; url: LearningObject.Material.Url }) {
    this.urlUpdated.emit(data);
  }

  /**
   * Removes a link from learning object repository URLs
   *
   * @param {any} index
   * @returns
   * @memberof UploadComponent
   */
  removeURL(index) {
    this.urlRemoved.emit(index);
  }

  updateNotes(notes: string) {
    this.notes$.next(notes ? notes.trim() : '');
  }

  /**
   * Sends a list of files to API for deletion & Updates learning object
   *
   * @returns {Promise<void>}
   * @memberof UploadComponent
   */
  async *handleDeletion(files: string[]) {
    this.showDeleteConfirmation();
    const confirmed: boolean = yield;
    if (confirmed) {
      this.saving$.next(true);
      try {
        const object = await this.learningObject$.pipe(take(1)).toPromise();
        await Promise.all(
          files.map(async (fileId) => {
            await this.fileManager.delete(object, fileId);
          }),
        );
        this.filesDeleted.emit(files);
      } catch (e) {
        this.error$.next(e);
      }
      this.saving$.next(false);
    }
  }

  /**
   * Handles showing deletion confirmation modal
   *
   * @memberof UploadComponent
   */
  showDeleteConfirmation() {
    this.showDeletePopup = true;
  }

  /**
   * Handles hiding deletion confirmation modal
   *
   * @memberof UploadComponent
   */
  hideDeleteConfirmation() {
    this.showDeletePopup = false;
  }

  /**
   * Confirms deletion
   *
   * @memberof UploadComponent
   */
  confirmDeletion() {
    this.handleDeleteGenerator.next(true);
    this.hideDeleteConfirmation();
  }

  /**
   * Cancels deletion
   *
   * @memberof UploadComponent
   */
  cancelDeletion() {
    this.handleDeleteGenerator.next(false);
    this.hideDeleteConfirmation();
  }

  /**
   * Adds description to file or folderMeat
   *
   * @param {any} file
   * @returns {Promise<void>}
   * @memberof UploadComponent
   */
  async handleEdit(file: LearningObject.Material.File | any): Promise<void> {
    try {
      if (!file.isFolder) {
        this.fileDescriptionUpdated.emit({
          id: file.id,
          description: file.description,
        });
      } else {
        const index = await this.findFolder(file.path);
        if (index > -1) {
          this.folderDescriptionUpdated.emit({
            index,
            description: file.description,
          });
        } else {
          this.folderDescriptionUpdated.emit({
            path: file.path,
            description: file.description,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Finds index of folder
   *
   * @private
   * @param {string} path
   * @returns {number}
   * @memberof UploadComponent
   */
  private async findFolder(path: string): Promise<number> {
    let index = -1;
    const object = await this.learningObject$.pipe(take(1)).toPromise();
    const folders = object.materials.folderDescriptions;
    for (let i = 0; i < folders.length; i++) {
      const folderPath = folders[i].path;
      if (folderPath === path) {
        index = i;
        break;
      }
    }
    return index;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
  }
}
