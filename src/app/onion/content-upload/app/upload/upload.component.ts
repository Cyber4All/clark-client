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
import {
  DropzoneDirective,
  DropzoneConfigInterface
} from '@cyber4all/ngx-dropzone-wrapper';
import { ToasterService } from '../../../../shared/toaster';
import { environment } from '../../environments/environment';
import { TOOLTIP_TEXT } from '@env/tooltip-text';
import {
  File,
  FolderDescription
} from '@cyber4all/clark-entity/dist/learning-object';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Removal } from '../../../../shared/filesystem/file-browser/file-browser.component';
import { fromEvent, Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/filter';
import { ModalService, ModalListElement } from '../../../../shared/modals';
import { USER_ROUTES, PUBLIC_LEARNING_OBJECT_ROUTES } from '@env/route';
import {
  getPaths,
  canViewInBrowser
} from '../../../../shared/filesystem/file-functions';
import { AuthService } from '../../../../core/auth.service';

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
  @ViewChild(DropzoneDirective)
  dzDirectiveRef: DropzoneDirective;

  learningObjectName: string;

  slide = 1;
  animationDirection: 'prev' | 'next' = 'next';
  showDragMenu = false;
  dropped = false;

  saving = false;
  retrieving = false;

  // @ts-ignore The ngx-dropzone doesn't believe generatePreview is a valid config option
  config: DropzoneConfigInterface = {
    ...environment.DROPZONE_CONFIG,
    renameFile: (file: any) => {
      return this.renameFile(file);
    }
  };

  files$: BehaviorSubject<LearningObjectFile[]> = new BehaviorSubject<
    LearningObjectFile[]
  >([]);
  folderMeta$: BehaviorSubject<FolderDescription[]> = new BehaviorSubject<
    FolderDescription[]
  >([]);

  inProgressFileUploads = [];
  inProgressFolderUploads = [];
  inProgressUploadsMap: Map<string, number> = new Map<string, number>();
  tips = TOOLTIP_TEXT;

  learningObject: LearningObject;

  uploading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  confirmDeletion$ = new Subject<boolean>();
  triggerSave$ = new Subject<void>();
  unsubscribe$ = new Subject<void>();

  openPath: string;

  disabled = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private learningObjectService: LearningObjectService,
    private fileStorageService: FileStorageService,
    private notificationService: ToasterService,
    private changeDetector: ChangeDetectorRef,
    private modalService: ModalService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.disabled) {
      this.checkAccessGroup();
    }
    this.learningObjectName = this.route.snapshot.params.learningObjectName;
    this.learningObjectName
      ? this.fetchLearningObject()
      : this.router.navigate(['/onion/dashboard']);

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
      this.config.url = USER_ROUTES.POST_FILE_TO_LEARNING_OBJECT(
        this.learningObject.id
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
    this.files$.next(<LearningObjectFile[]>(
      this.learningObject.materials.files.map(file => {
        file.url = PUBLIC_LEARNING_OBJECT_ROUTES.DOWNLOAD_FILE({
          username: this.learningObject.author.username,
          loId: this.learningObject.id,
          fileId: file.id,
          open: canViewInBrowser(file)
        });
        return file;
      })
    ));
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
   * Fired when file is added. Verifies limit hasn't been reached and adds to queued files & filesystem
   *
   * @param {DZFile} file
   * @memberof UploadComponent
   */
  async addFile(file: DZFile) {
    try {
      if (!file.rootFolder) {
        // this is a file addition
        this.inProgressFileUploads.push(file);
        this.inProgressUploadsMap.set(
          file.upload.uuid,
          this.inProgressFileUploads.length - 1
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  fileSending(event) {
    const file: DZFile = event[0];
    // @ts-ignore
    (<FormData>event[2]).append('size', file.size);
    if (file.fullPath) {
      (<FormData>event[2]).append('fullPath', file.fullPath);
    }
  }

  uploadProgress(event) {
    try {
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
    } catch (error) {
      console.log(error);
    }
  }

  dzComplete(event) {
    try {
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
    } catch (e) {
      console.log(e);
    }
  }

  handleError(event) {
    console.log('ERROR: ', event);
  }

  handleCanceled(event) {
    console.log('CANCELED : ', event);
  }

  async queueComplete(event) {
    try {
      this.learningObject = await this.learningObjectService.getLearningObject(
        this.learningObjectName
      );
      this.updateFileSubscription();
      await this.learningObjectService.updateReadme(
        this.authService.username,
        this.learningObject.id
      );
    } catch (e) {
      console.log(e);
    }
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
    try {
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
    } catch (error) {
      console.error(error);
    }
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
   * On submission, if there are scheduled deletions files within scheduled deletions get deleted
   * any added files get uploaded, then learning object is updated and user is navigated to
   * content view.
   *
   * @memberof UploadComponent
   */
  async save(stayOnPage?: boolean) {
    try {
      this.saving = true;

      this.fixURLs();
      try {
        await this.saveLearningObject();
        this.saving = false;
        this.updateFileSubscription();
        if (!stayOnPage) {
          this.router.navigate(['/onion/dashboard']);
        }
      } catch (e) {
        this.saving = false;
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
      this.notificationService.notify(
        'Could not upload your materials.',
        `${e}`,
        'bad',
        'far fa-times'
      );
    }
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
        await this.learningObjectService.updateReadme(
          this.authService.username,
          this.learningObject.id
        );
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
          this.learningObject.materials['folderDescriptions'][
            index
          ].description = file.description;
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
      await this.saveLearningObject();
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Initiates a save of the learning object in it's current state in the component
   */
  async saveLearningObject(): Promise<void> {
    try {
      this.saving = true;
      await this.learningObjectService.save(this.learningObject);
    } catch (e) {
      console.log(e);
    }
    this.saving = false;
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

  private async checkAccessGroup() {
    this.disabled = !this.authService.hasPrivelagedAccess();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.unsubscribe();
  }
}
