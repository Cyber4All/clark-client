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
} from '@cyber4all/ngx-dropzone-wrapper';
import { ToasterService } from '../../../../../../shared/toaster';
import { environment } from '../../environments/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import {
  LearningObject,
} from '@cyber4all/clark-entity';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { fromEvent } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import {
  ModalService,
  ModalListElement
} from '../../../../../../shared/modals';
import { USER_ROUTES } from '@env/route';
import { getPaths } from '../../../../../../shared/filesystem/file-functions';
import { AuthService } from 'app/core/auth.service';
import { FileStorageService } from '../services/file-storage.service';

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
        style({ bottom: '-20px', opacity: 0 }),
        animate('200ms 200ms ease-out', style({ bottom: '20px', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ bottom: '20px', opacity: 1 }),
        animate('200ms ease-out', style({ bottom: '-20px', opacity: 0 }))
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
  saving$: Observable<boolean> = new Observable<boolean>();
  @Input()
  learningObject$: Observable<LearningObject> = new Observable<
    LearningObject
  >();

  @Output()
  fileDeleted: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  uploadComplete: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  urlAdded: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  urlUpdated: EventEmitter<{ index: string; url: LearningObject.Material.Url }> = new EventEmitter<{
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
    parallelChunkUploads: true
  };

  files$: BehaviorSubject<LearningObject.Material.File[]> = new BehaviorSubject<
  LearningObject.Material.File[]
  >([]);
  folderMeta$: BehaviorSubject<LearningObject.Material.FolderDescription[]> = new BehaviorSubject<
  LearningObject.Material.FolderDescription[]
  >([]);

  inProgressFileUploads = [];
  inProgressFolderUploads = [];
  inProgressUploadsMap: Map<string, number> = new Map<string, number>();
  tips = TOOLTIP_TEXT;

  unsubscribe$ = new Subject<void>();

  openPath: string;

  disabled = false;

  private uploadIds = {

  }

  solutionUpload = false;

  constructor(
    // FIXME: REMOVE WHEN WHITELIST LOGIC IS REMOVED
    private authService: AuthService,
    private notificationService: ToasterService,
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService,
    private fileStorage: FileStorageService
  ) {}

  ngOnInit() {
    if (this.disabled) {
      this.checkWhitelist();
    }
    this.learningObject$.takeUntil(this.unsubscribe$).subscribe(object => {
      let solution = false;
      if (object) {
        this.config.url = USER_ROUTES.POST_FILE_TO_LEARNING_OBJECT(object.id);
        this.files$.next(object.materials.files);
        this.folderMeta$.next(object.materials.folderDescriptions);
        this.files$.forEach(val => {
          val.forEach(file => {
            if (file.name.toLowerCase().indexOf('solution') >= 0)
              solution = true;
          });
        });
        if (solution)
          this.solutionUpload = true;
        else
          this.solutionUpload = false;
      }
    });

    this.notes$
      .takeUntil(this.unsubscribe$)
      .debounceTime(650)
      .subscribe(notes => {
        this.notesUpdated.emit(notes);
      });

    this.error$.takeUntil(this.unsubscribe$).subscribe(err => {
      if (err) {
        if (err['error']) {
          err = err['error'];
        }
        this.notificationService.notify('Error!', err, 'bad', 'far fa-times');
      }
    });
  }

  ngAfterViewInit() {
    // create an observable from the dragover event and subscribe to it to show the dropzone popover
    fromEvent(document.getElementsByTagName('body')[0], 'dragover')
      .takeUntil(this.unsubscribe$)
      .subscribe((event: any) => {
        const types = event.dataTransfer.types;
        if (types.filter(x => x === 'Files').length >= 1 && !this.disabled) {
          this.toggleDrag(true);
        }
      });

    // create an observable from the dragover event and subscribe to it to show the dropzone popover
    fromEvent(document.getElementsByTagName('body')[0], 'dragleave')
      .takeUntil(this.unsubscribe$)
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
        if (file.upload.chunked) {
          // Request multipart upload
          const learningObject = await this.learningObject$.take(1).toPromise();
          const uploadId  = await this.fileStorage.initMultipart({
            learningObject,
            fileId: file.upload.uuid,
            filePath: file.fullPath ? file.fullPath : file.name
          });
          this.uploadIds[file.upload.uuid] = uploadId;
        }
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
    if(file.upload.chunked){
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
        const fileMeta = {
          dzuuid: file.upload.uuid,
          name: file.name,
          size: file.size,
          fullPath: file.fullPath,
          mimetype: file.type
        };
        const uploadId = this.uploadIds[file.upload.uuid];
        const learningObject = await this.learningObject$.take(1).toPromise();
        await this.fileStorage.finalizeMultipart({
          fileMeta,
          learningObject,
          fileId: file.upload.uuid,
          uploadId
        });
        this.uploadComplete.emit();
      } catch (e) {
        console.log(e);
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
    const learningObject = await this.learningObject$.take(1).toPromise();
    const uploadId = this.uploadIds[file.upload.uuid];

    this.fileStorage.abortMultipart({
      learningObject,
      uploadId,
      fileId: file.upload.uuid
    });
  }

  /**
   * Fired when DZDropzone emits queuecomplete
   *
   * @memberof UploadComponent
   */
  queueComplete() {
    this.uploadErrors = {};
  }

  /**
   * Fired when DZDropzone emits success
   *
   * @memberof UploadComponent
   */
  uploadSuccess() {
    this.uploadComplete.emit();
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

  // /**
  //  * Corrects malformed URLs and removes empty URLs
  //  *
  //  * @memberof UploadComponent
  //  */
  // fixURLs() {
  //   for (let i = 0; i < this.learningObject.materials.urls.length; i++) {
  //     const url = this.learningObject.materials.urls[i];
  //     if (!url.title || !url.url) {
  //       this.removeURL(i);
  //     } else if (!url.url.match(/https?:\/\/.+/i)) {
  //       url.url = `http://${url.url}`;
  //       this.learningObject.materials.urls[i] = url;
  //     }
  //   }
  // }

  /**
   * Sends a list of files to API for deletion & Updates learning object
   *
   * @returns {Promise<void>}
   * @memberof UploadComponent
   */
  async handleDeletion(files: string[]): Promise<void> {
    const confirmed = await this.modalService
      .makeDialogMenu(
        'materialDelete',
        'Are you sure?',
        'You cannot undo this action!',
        false,
        'title-bad',
        'center',
        [
          new ModalListElement('Yup, do it!', 'confirm', 'bad'),
          new ModalListElement('Nevermind!', 'cancel', 'neutral')
        ]
      )
      .toPromise();

    if (confirmed === 'confirm') {
      try {
        const object = await this.learningObject$.take(1).toPromise();
        await Promise.all(
          files.map(async fileId => {
            await this.fileStorage.delete(object, fileId);
            this.fileDeleted.emit(fileId);
          })
        );
      } catch (e) {
        this.error$.next(e);
      }
    }
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
      console.log(e);
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
    const object = await this.learningObject$.take(1).toPromise();
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

  // FIXME: Hotfix for white listing. Remove if functionality is extended or removed
  private async checkWhitelist() {
    try {
      const response = await fetch(environment.whiteListURL);
      const object = await response.json();
      const whitelist: string[] = object.whitelist;
      const username = this.authService.username;
      if (whitelist.includes(username)) {
        this.disabled = false;
      }
    } catch (e) {
      console.log(e);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
  }
}
