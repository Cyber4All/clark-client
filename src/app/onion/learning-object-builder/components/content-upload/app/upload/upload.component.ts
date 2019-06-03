import { takeUntil, debounceTime, take } from 'rxjs/operators';
import { trigger, style, animate, transition } from '@angular/animations';
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
  AfterViewInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  DropzoneDirective,
  DropzoneConfigInterface
} from 'ngx-dropzone-wrapper';
import { ToasterService } from '../../../../../../shared/toaster';
import { environment } from '../../environments/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { LearningObject } from '@entity';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';

import { ModalService } from '../../../../../../shared/modals';
import { USER_ROUTES } from '@env/route';
import { getPaths } from '../../../../../../shared/filesystem/file-functions';
import {
  FileStorageService,
  FileUploadMeta
} from '../services/file-storage.service';
import { CookieService } from 'ngx-cookie';
import { AuthService } from 'app/core/auth.service';

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
  styleUrls: ['./upload.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms', style({ opacity: 1 }))
      ])
    ]),
    trigger('uploadQueue', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate(
          '200ms 200ms ease-out',
          style({ transform: 'translateY(0px)', opacity: 1 })
        )
      ]),
      transition(':leave', [
        style({ transform: 'translateY(-0px)', opacity: 1 }),
        animate(
          '200ms ease-out',
          style({ transform: 'translateY(20px)', opacity: 0 })
        )
      ])
    ])
  ]
})
export class UploadComponent implements OnInit, AfterViewInit, OnDestroy {
  private uploadErrors = {};
  @ViewChild(DropzoneDirective)
  dzDirectiveRef: DropzoneDirective;

  @Input()
  error$: Subject<string> = new Subject<string>();
  @Input()
  saving$: Subject<boolean> = new Subject<boolean>();
  @Input()
  learningObject$: Observable<LearningObject> = new Observable<
    LearningObject
  >();

  @Output()
  filesDeleted: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output()
  uploadComplete: EventEmitter<void> = new EventEmitter<void>();
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

  notes$: Subject<string> = new Subject<string>();

  slide = 1;
  animationDirection: 'prev' | 'next' = 'next';
  showDragMenu = false;
  dropped = false;

  retrieving = false;

  // @ts-ignore The ngx-dropzone doesn't believe generatePreview is a valid config option
  config: DropzoneConfigInterface = {
    ...environment.DROPZONE_CONFIG,
    renameFile: (file: any) => {
      return this.renameFile(file);
    },
    autoQueue: false,
    parallelChunkUploads: true,
    headers: { Authorization: '' }
  };

  files$: BehaviorSubject<LearningObject.Material.File[]> = new BehaviorSubject<
    LearningObject.Material.File[]
  >([]);
  folderMeta$: BehaviorSubject<
    LearningObject.Material.FolderDescription[]
  > = new BehaviorSubject<LearningObject.Material.FolderDescription[]>([]);

  inProgressFileUploads = [];
  inProgressFolderUploads = [];
  inProgressUploadsMap: Map<string, number> = new Map<string, number>();
  tips = TOOLTIP_TEXT;

  unsubscribe$ = new Subject<void>();

  openPath: string;

  solutionUpload = false;

  showDeletePopup = false;
  handleDeleteGenerator: Iterator<void>;

  private uploadIds = {};
  private userIsPrivileged = false;

  constructor(
    private notificationService: ToasterService,
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService,
    private fileStorage: FileStorageService,
    private cookie: CookieService,
    private auth: AuthService
  ) {
    this.config.headers.Authorization = `Bearer ${this.cookie.get('presence')}`;
    this.userIsPrivileged = this.auth.isAdminOrEditor();
  }

  ngOnInit() {
    this.learningObject$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(object => {
        if (object) {
          this.config.url = this.getFileUploadUrl({
            learningObjectId: object.id,
            authorUsername: object.author.username
          });
          this.files$.next(object.materials.files);
          this.folderMeta$.next(object.materials.folderDescriptions);
          this.solutionUpload = false;
          this.files$.value.forEach(file => {
            if (file.name.toLowerCase().indexOf('solution') >= 0) {
              this.solutionUpload = true;
            }
          });
        }
      });

    this.notes$
      .pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(650)
      )
      .subscribe(notes => {
        this.notesUpdated.emit(notes);
      });

    this.error$.pipe(takeUntil(this.unsubscribe$)).subscribe(err => {
      if (err) {
        if (err['error']) {
          err = err['error'];
        }
        this.notificationService.notify('Error!', err, 'bad', 'far fa-times');
      }
    });
  }

  /**
   *  Gets upload URL based on user access privileges
   *  FIXME: TESTING PURPOSES ONLY. Remove after test of file upload service is completed
   *
   * @param {{
   *     learningObjectId: string;
   *     authorUsername: string;
   *   }} {
   *     learningObjectId,
   *     authorUsername
   *   }
   * @returns {string}
   * @memberof UploadComponent
   */
  getFileUploadUrl({
    learningObjectId,
    authorUsername
  }: {
    learningObjectId: string;
    authorUsername: string;
  }): string {
    let url = USER_ROUTES.POST_FILE_TO_LEARNING_OBJECT(
      learningObjectId,
      authorUsername
    );
    if (this.userIsPrivileged) {
      url = USER_ROUTES.POST_FILE_TO_LEARNING_OBJECT_ADMIN(
        learningObjectId,
        authorUsername
      );
    }
    return url;
  }

  ngAfterViewInit() {
    // create an observable from the dragover event and subscribe to it to show the dropzone popover
    fromEvent(document.getElementsByTagName('body')[0], 'dragover')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: any) => {
        const types = event.dataTransfer.types;
        if (types.filter(x => x === 'Files').length >= 1) {
          this.toggleDrag(true);
        }
      });

    // create an observable from the dragover event and subscribe to it to show the dropzone popover
    fromEvent(document.getElementsByTagName('body')[0], 'dragleave')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: any) => {
        if (event.target.classList.contains('uploader')) {
          this.toggleDrag(false);
        }
      });
  }

  /**
   * Change and animate a new slide onto the screen
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
   * Handle the file drop event
   */
  handleDrop() {
    this.toggleDrag(false, 300);
    this.toggleDropped(true);
  }

  /**
   * Opens Dropzone upload dialog
   *
   * @memberof UploadComponent
   */
  openDZ() {
    // @ts-ignore
    document.querySelector('.dz-hidden-input').click();
  }

  /**
   * Fired when file is added. Verifies limit hasn't been reached and adds to queued files & filesystem
   *
   * @param {DZFile} file
   * @memberof UploadComponent
   */
  async addFile(file: DZFile) {
    delete this.uploadErrors[file.upload.uuid];
    try {
      if (!file.rootFolder) {
        // this is a file addition
        this.inProgressFileUploads.push(file);
        this.inProgressUploadsMap.set(
          file.upload.uuid,
          this.inProgressFileUploads.length - 1
        );
      }
        if (file.upload.chunked) {
          // Request multipart upload
          const learningObject = await this.learningObject$
            .pipe(take(1))
            .toPromise();

          // FIXME: Conditional block for TESTING PURPOSES ONLY. Remove after test of file upload service is completed
          let uploadId = '';
          if (this.userIsPrivileged) {
            const fileUploadMeta: FileUploadMeta = {
              name: file.name,
              path: file.fullPath || file.name,
              fileType: file.type,
              size: file.size
            };
            uploadId = await this.fileStorage.initMultipartAdmin({
              fileUploadMeta,
              fileId: file.upload.uuid,
              learningObjectId: learningObject.id,
              authorUsername: learningObject.author.username
            });
          } else {
            uploadId = await this.fileStorage.initMultipart({
              learningObject,
              fileId: file.upload.uuid,
              filePath: file.fullPath ? file.fullPath : file.name
            });
          }
          this.uploadIds[file.upload.uuid] = uploadId;
        }
      this.dzDirectiveRef.dropzone().processFile(file);
    } catch (error) {
      this.error$.next(error);
    }
  }

  fileSending(event) {
    const file: DZFile = event[0];
    // @ts-ignore
    (<FormData>event[2]).append('size', file.size);
    if (file.fullPath) {
      (<FormData>event[2]).append('fullPath', file.fullPath);
    }
    if (file.upload.chunked) {
      const uploadId = this.uploadIds[file.upload.uuid];
      (<FormData>event[2]).append('uploadId', uploadId);
    }
  }

  uploadProgress(event) {
    const file = event[0];
    const newProgress = Math.min(100, (event[2] / file.size) * 100);
    let index;

    if (file.rootFolder) {
      // this is a folder update
      // locate the folder in the array
      index = this.inProgressUploadsMap.get(file.rootFolder);
      const folder = this.inProgressFolderUploads[index];

      // set this files progress
      folder.allProgress.set(file.fullPath, newProgress);

      // calculate the folders overall progress
      folder.progress = Math.ceil(
        Array.from(folder.allProgress.values() as number[]).reduce(
          (x, y) => x + y
        ) / folder.items
      );
    } else {
      // this is a file update
      index = this.inProgressUploadsMap.get(file.upload.uuid);
      this.inProgressFileUploads[index].progress = Math.ceil(newProgress);
    }
  }

  async dzComplete(file) {
    const progressCheck = this.inProgressFileUploads
      .filter(x => typeof x.progress !== 'number' || x.progress < 100)
      .concat(
        this.inProgressFolderUploads.filter(
          x => typeof x.progress !== 'number' || x.progress < 100
        )
      );

    if (!progressCheck.length) {
      this.inProgressFileUploads = [];
      this.inProgressFolderUploads = [];
      this.inProgressUploadsMap = new Map();
    }
    if (file.upload.chunked && file.status !== 'error') {
      try {
        const uploadId = this.uploadIds[file.upload.uuid];
        const learningObject = await this.learningObject$
          .pipe(take(1))
          .toPromise();

        // FIXME: Conditional block for TESTING PURPOSES ONLY. Remove after test of file upload service is completed
        if (this.userIsPrivileged) {
          await this.fileStorage.finalizeMultipartAdmin({
            learningObjectId: learningObject.id,
            authorUsername: learningObject.author.username,
            fileId: file.upload.uuid,
            uploadId
          });
        } else {
          await this.fileStorage.finalizeMultipart({
            learningObjectId: learningObject.id,
            authorUsername: learningObject.author.username,
            fileId: file.upload.uuid,
            uploadId
          });
        }

        this.uploadComplete.emit();
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Displays error message and aborts upload if chunked upload
   *
   * @param {*} events
   * @memberof UploadComponent
   */
  async handleError(events) {
    // Timeout was needed to prevent issues with parallel chunk uploads which would all error out at the same time
    const file = await new Promise<any>(resolve => {
      setTimeout(() => resolve(events[0]), 800);
    });
    if (!this.uploadErrors[file.upload.uuid]) {
      this.uploadErrors[file.upload.uuid] = 1;
      this.error$.next(`Could not upload ${file.name}.`);
      if (file.upload.chunked) {
        this.abortMultipartUpload(file);
      }
    }
  }

  /**
   * Cancels multipart upload
   *
   * @private
   * @param {*} file
   * @memberof UploadComponent
   */
  private async abortMultipartUpload(file: any) {
    const learningObject = await this.learningObject$.pipe(take(1)).toPromise();
    const uploadId = this.uploadIds[file.upload.uuid];
    // FIXME: Conditional block for TESTING PURPOSES ONLY. Remove after test of file upload service is completed
    if (this.userIsPrivileged) {
      this.fileStorage.abortMultipartAdmin({
        learningObjectId: learningObject.id,
        authorUsername: learningObject.author.username,
        uploadId,
        fileId: file.upload.uuid
      });
    } else {
      this.fileStorage.abortMultipart({
        learningObject,
        uploadId,
        fileId: file.upload.uuid
      });
    }
  }

  /**
   * Fired when DZDropzone emits queuecomplete
   *
   * @memberof UploadComponent
   */
  queueComplete() {
    this.uploadErrors = {};
    this.uploadComplete.emit();
  }

  /**
   * Fired when DZDropzone emits success
   *
   * @memberof UploadComponent
   */
  uploadSuccess() {}

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
    if (path) {
      file.fullPath = path;
      const rootFolder = getPaths(path)[0];
      file.rootFolder = rootFolder;

      const index = this.inProgressUploadsMap.get(rootFolder);
      let folder = this.inProgressFolderUploads[index];

      if (folder) {
        folder.items++;
        folder.allProgress.set(file.fullPath, 0);
        this.inProgressFolderUploads[index] = folder;
      } else {
        folder = {
          items: 1,
          progress: 0,
          name: file.rootFolder,
          folder: true,
          allProgress: new Map()
        };

        folder.allProgress.set(file.fullPath, 0);

        this.inProgressFolderUploads.push(folder);
        this.inProgressUploadsMap.set(
          rootFolder,
          this.inProgressFolderUploads.length - 1
        );
      }
    } else {
      path = file.name;
    }

    return path.trim();
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
          files.map(async fileId => {
            await this.fileStorage.delete(object, fileId);
          })
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
          description: file.description
        });
      } else {
        const index = await this.findFolder(file.path);
        if (index > -1) {
          this.folderDescriptionUpdated.emit({
            index,
            description: file.description
          });
        } else {
          this.folderDescriptionUpdated.emit({
            path: file.path,
            description: file.description
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
