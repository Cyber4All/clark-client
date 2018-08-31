import { trigger, style, animate, transition } from '@angular/animations';
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../../../core/learning-object.service';
import { FileStorageService } from '../services/file-storage.service';
import { DropzoneDirective } from 'ngx-dropzone-wrapper';
import { ToasterService } from '../../../../shared/toaster';
import { environment } from '../../environments/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import { File } from '@cyber4all/clark-entity/dist/learning-object';
import * as uuid from 'uuid';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { getPaths } from '../../../../shared/filesystem/file-functions';
import { Removal } from '../../../../shared/filesystem/file-browser/file-browser.component';
import { fromEvent, Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import { ModalService, ModalListElement } from '../../../../shared/modals';

type LearningObjectFile = File;

export type File = {
  id?: string;
  accepted: boolean;
  fullPath: string;
  name: string;
  size: number;
  parent: string;
  [key: string]: any;
};

@Component({
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
        animate('200ms 400ms ease-out', style({ bottom: '20px', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ bottom: '20px', opacity: 1 }),
        animate('200ms ease-out', style({ bottom: '-20px', opacity: 0 }))
      ])
    ])
  ]
})
export class UploadComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DropzoneDirective)
  dzDirectiveRef: DropzoneDirective;

  private filePathMap: Map<string, string> = new Map<string, string>();
  private dzError = '';
  learningObjectName: string;

  slide = 1;
  animationDirection: 'prev' | 'next' = 'next';
  showDragMenu = false;
  dropped = false;

  saving = false;
  retrieving = false;

  files$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  folderMeta$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  queuedUploads$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);

  tips = TOOLTIP_TEXT;

  learningObject: LearningObject = new LearningObject(null, '');

  uploading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  confirmDeletion$ = new Subject<boolean>();
  triggerSave$ = new Subject<void>();
  unsubscribe$ = new Subject<void>();

  openPath: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private learningObjectService: LearningObjectService,
    private fileStorageService: FileStorageService,
    private notificationService: ToasterService,
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.learningObjectName = this.route.snapshot.params.learningObjectName;
    this.learningObjectName
      ? this.fetchLearningObject()
      : this.router.navigate(['/onion/dashboard']);

    // Listen for queuedUploads trigger and, if the current value is an array with length > 0, close dropzone popover and save
    this.queuedUploads$
      .filter(x => x !== [] && x.length > 0)
      .debounceTime(250)
      .takeUntil(this.unsubscribe$)
      .subscribe(() => {
        this.handleDrop();
        this.save(true);
      });

    // when this event fires, after a debounce, save the learning object (used on inputs to prevent multiple HTTP queries while typing)
    this.triggerSave$
      .takeUntil(this.unsubscribe$)
      .debounceTime(650)
      .subscribe(() => {
        this.saveLearningObject();
      });
  }

  ngAfterViewInit() {
    // create an observable from the dragover event and subscribe to it to show the dropzone popover
    fromEvent(document.getElementsByTagName('body')[0], 'dragover')
      .takeUntil(this.unsubscribe$)
      .subscribe(() => {
        this.toggleDrag(true);
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
    // this.dzDirectiveRef.dropzone().clickableElements[0].click();
    // @ts-ignore
    document.querySelector('.dz-hidden-input').click();
  }

  /**
   * Fetches Learning Object by name
   *
   * @private
   * @memberof ViewComponent
   */
  private async fetchLearningObject() {
    try {
      this.retrieving = true;
      this.learningObject = await this.learningObjectService.getLearningObject(
        this.learningObjectName
      );
      this.retrieving = false;
      // FIXME: Add folder descriptions to entity
      // ADD FOLDER DESCRIPTION PROP IF NOT EXIST
      if (!this.learningObject.materials['folderDescriptions']) {
        this.learningObject.materials['folderDescriptions'] = [];
      }
      this.updateFileSubscription();
      this.updateFolderMeta();
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
    this.folderMeta$.next(this.learningObject.materials['folderDescriptions']);
  }

  /**
   * Fired when file is added. Verifies limit hasn't been reached and adds to queued files & filesystem
   *
   * @param {File} file
   * @memberof UploadComponent
   */
  async addFile(file) {
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

    file.id = this.getUUID();
    const isFolder = this.isFolder(file);

    if (isFolder) {
      this.mapToPath(file);
    }

    const queue = this.queuedUploads$.getValue();
    queue.push(file);

    this.queuedUploads$.next(queue);
  }

  /**
   * Checks if file as fullPath or webkitRelativePath property and sets the fullPath prop;
   *
   * @private
   * @param {any} file
   * @returns
   * @memberof UploadComponent
   */
  private setFullPath(file) {
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
   * Check upload is folder or not
   *
   * @param {File} file
   * @returns {boolean}
   * @memberof UploadComponent
   */
  private isFolder(file: File): boolean {
    if (!file.fullPath) {
      return false;
    }
    const paths: string[] = getPaths(file.fullPath);
    if (paths.length > 0) {
      return true;
    }
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
   * @param {File[]} loFiles
   * @memberof UploadComponent
   */
  updateFiles(loFiles: File[]) {
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
      this.saving = true;
      const learningObjectFiles = await this.upload();

      this.uploading$.next(false);

      this.updateFiles(learningObjectFiles);

      this.fixURLs();
      try {
        await this.saveLearningObject();
        this.saving = false;
        this.uploading$.next(false);
        this.updateFileSubscription();
        if (!stayOnPage) {
          this.router.navigate(['/onion/dashboard']);
        }
      } catch (e) {
        this.saving = false;
        this.uploading$.next(false);
        this.notificationService.notify(
          'Could not update your materials.',
          `${e}`,
          'bad',
          'far fa-times'
        );
      }
    } catch (e) {
      this.saving = false;
      console.log(e);
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
    this.saving = true;
    const queue = this.queuedUploads$.getValue();

    if (queue.length >= 1) {
      this.uploading$.next(true);

      const learningObjectFiles = await this.fileStorageService.upload(
        this.learningObject,
        queue,
        this.filePathMap
      );
      this.queuedUploads$.next([]);

      return learningObjectFiles;
    }
    this.saving = false;
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
        if (params.removal.type === 'folder') {
          const index = this.findFolder(params.removal.path);
          (<any[]>this.learningObject.materials['folderDescriptions']).splice(
            index,
            1
          );
        }
        this.saving = true;
        await this.deleteFromMaterials(params.files);
        this.deleteFiles(params.files);
        this.updateFileSubscription();
        this.confirmDeletion$.next(true);
        this.saving = false;
      } catch (e) {
        console.log(e);
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
  async handleEdit(file): Promise<void> {
    try {
      if (!file.isFolder) {
        const index = this.findFile(file.path);
        this.learningObject.materials.files[index].description =
          file.description;
        this.updateFileSubscription();
      } else {
        const index = this.findFolder(file.path);
        if (index > -1) {
          this.learningObject.materials['folderDescriptions'][
            index
          ].description = file.description;
        } else {
          const folderDescription = {
            path: file.path,
            description: file.description
          };
          this.learningObject.materials['folderDescriptions'].push(
            folderDescription
          );
        }
        this.updateFolderMeta();
      }
      await this.saveLearningObject();
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Initiates a save of the learning object in it's current state in the component
   */
  async saveLearningObject(): Promise<{}> {
    this.saving = true;
    return this.learningObjectService.save(this.learningObject).then(() => {
      this.saving = false;
      return {}; // why?
    });
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
    return this.saveLearningObject();
  }

  /**
   * Deletes files from S3
   *
   * @private
   * @param {string[]} files
   * @memberof UploadComponent
   */
  private async deleteFiles(files: string[]) {
    this.saving = true;
    for (const file of files) {
      await this.fileStorageService.delete(this.learningObject, file);
    }
    this.saving = false;
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
    const folders = this.learningObject.materials['folderDescriptions'];
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

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
  }
}
