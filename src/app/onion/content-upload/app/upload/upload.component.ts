import { ModalService } from '../../../../shared/modals';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { LearningObject } from '@cyber4all/clark-entity';
import { LearningObjectService } from '../../../core/learning-object.service';
import { FileStorageService } from '../services/file-storage.service';
import { DropzoneDirective } from 'ngx-dropzone-wrapper';
import { LearningObjectFile } from '../models/learning-object-file';
import { TimeFunctions } from '../time-functions';
import { NotificationService } from '../../../../shared/notifications';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: [
    '../../styles.css',
    './upload.component.scss',
    '../../dropzone.scss'
  ]
})
export class UploadComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DropzoneDirective) dzDirectiveRef: DropzoneDirective;

  private routeParamSub: any;
  learningObjectName: string;

  hasFile: boolean = false;

  learningObject: LearningObject = new LearningObject(null, '');

  scheduledDeletions: {}[] = [];

  TimeFunctions: TimeFunctions = new TimeFunctions();

  uploading: boolean = false;
  submitting: boolean = false;

  file_descriptions: Map<number, string> = new Map();

  acceptedFiles: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private learningObjectService: LearningObjectService,
    private fileStorageService: FileStorageService,
    private notificationService: NotificationService
  ) {}

  async addFile(file) {
    await file;
    if (file.accepted) {
      this.acceptedFiles.push(file);
    } else {
      this.notificationService.notify(
        'File too large',
        `${file.name} could not be added`,
        'bad',
        ''
      );
    }
  }

  ngOnInit() {
    this.getRouteParams();
    this.fetchLearningObject();
  }

  ngAfterViewInit(): void {}
  /**
   * Gets route param
   *
   * @memberof UploadComponent
   */
  getRouteParams() {
    this.routeParamSub = this.route.params.subscribe(params => {
      this.learningObjectName = params['learningObjectName'];
    });
  }
  /**
   * Fetches learning object
   *
   * @memberof UploadComponent
   */
  fetchLearningObject(): void {
    this.learningObjectService
      .getLearningObject(this.learningObjectName)
      .then(learningObject => {
        this.learningObject = learningObject;
      })
      .catch(err => {
        alert('Invalid Learning Object.');
      });
  }
  /**
   * Removes files from Dropzone Queue
   * If no file is passed removes all files from queue
   *
   * @param {any} file
   * @memberof UploadComponent
   */
  removeFromDZ(file) {
    file
      ? this.dzDirectiveRef.dropzone().removeFile(file)
      : this.dzDirectiveRef.dropzone().removeAllFiles();
    this.acceptedFiles = this.dzDirectiveRef.dropzone().getAcceptedFiles();
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

  fixURLs() {
    for (let i = 0; i < this.learningObject.materials.urls.length; i++) {
      let url = this.learningObject.materials.urls[i];
      if (!url.url.match(/https?:\/\/.+/i)) {
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

      this.learningObject.materials.files = [
        ...this.learningObject.materials.files,
        ...(<any>learningObjectFiles)
      ];
      this.fixURLs();
      try {
        await this.learningObjectService.save(this.learningObject);
        this.submitting = false;
        this.uploading = false;
        this.router.navigateByUrl(
          `onion/content/view/${this.learningObjectName}`
        );
      } catch (e) {
        console.log(e);
        this.submitting = false;
        this.uploading = false;
        this.notificationService.notify(
          'Error!',
          'Could not update your materials.',
          'bad',
          'far fa-times'
        );
      }
    } catch (e) {
      this.submitting = false;
      this.uploading = false;
      console.log(e);
      this.notificationService.notify(
        'Error!',
        'Could not upload your materials.',
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
    if (this.acceptedFiles.length >= 1) {
      let files = this.mapFileDescriptions();
      this.uploading = true;
      let learningObjectFiles = await this.fileStorageService.upload(
        this.learningObject,
        files
      );
      for (let i = 0; i < learningObjectFiles.length; i++) {
        learningObjectFiles[i]['description'] = this.file_descriptions.get(
          learningObjectFiles[i]['description']
        );
      }
      return learningObjectFiles;
    }
    this.uploading = false;
    return Promise.resolve([]);
  }

  private mapFileDescriptions() {
    let files = this.acceptedFiles;
    for (let i = 0; i < files.length; i++) {
      this.file_descriptions.set(i, files[i].description);
      files[i].descriptionID = i;
    }
    return files;
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

  ngOnDestroy() {
    this.routeParamSub.unsubscribe();
  }
}
