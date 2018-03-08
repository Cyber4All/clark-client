import { ModalService } from '../../../../shared/modals';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
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
  styleUrls: ['../../styles.css', './upload.component.scss', '../../dropzone.scss']
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private learningObjectService: LearningObjectService,
    private fileStorageService: FileStorageService,
    private notificationService: NotificationService
  ) {

  }

  ngOnInit() {
    this.getRouteParams();
    this.fetchLearningObject();
  }

  ngAfterViewInit(): void {
  }
  /**
   * Gets route param 
   * 
   * @memberof UploadComponent
   */
  getRouteParams() {
    this.routeParamSub = this.route.params.subscribe((params) => {
      this.learningObjectName = params['learningObjectName'];
    });
  }
  /**
   * Fetches learning object
   * 
   * @memberof UploadComponent
   */
  fetchLearningObject(): void {
    this.learningObjectService.getLearningObject(this.learningObjectName).then((learningObject) => {
      this.learningObject = learningObject;
    }).catch((err) => {
      alert("Invalid Learning Object.");
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
    file ? this.dzDirectiveRef.dropzone().removeFile(file) : this.dzDirectiveRef.dropzone().removeAllFiles();
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
    this.learningObject.repository.files.splice(index, 1);
  }

  /**
   * Adds a link to learning object repository URLs
   * 
   * @memberof UploadComponent
   */
  addURL() {
    this.learningObject.repository.urls.push({ title: '', url: '' });
  }

  /**
   * Removes a link from learning object repository URLs
   * 
   * @param {any} index 
   * @returns 
   * @memberof UploadComponent
   */
  removeURL(index) {
    if (this.learningObject.repository.urls.length > 0) {
      return this.learningObject.repository.urls.splice(index, 1);
    }
    return null;
  }

  fixURLs() {
    for (let i = 0; i < this.learningObject.repository.urls.length; i++) {
      let url = this.learningObject.repository.urls[i];
      if (!url.url.match(/https?:\/\/.+/i)) {
        url.url = `http://${url.url}`;
        this.learningObject.repository.urls[i] = url;
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
    this.submitting = true;
    if (this.scheduledDeletions.length > 0) {
      await this.deleteFiles();
    }

    let learningObjectFiles = await this.upload();
    this.uploading = false;

    typeof (learningObjectFiles) === 'string' ?
      this.learningObject.repository.files = [...this.learningObject.repository.files, ...JSON.parse(<any>learningObjectFiles)]
      : this.learningObject.repository.files = [...this.learningObject.repository.files, ...(<any>learningObjectFiles)];
    this.fixURLs();
    this.learningObjectService.save(this.learningObject)
      .then(
        (learningObject) => {
          this.submitting = false;
          this.router.navigateByUrl(`onion/content/view/${this.learningObjectName}`);
        }
      ).catch(
        (error) => {
          this.submitting = false;
          console.log(error)
          this.notificationService.notify('Error!', 'Could not update your materials.', 'bad', 'far fa-times');
        }
      );

  }

  /**
   * Sends files to API to be uploaded to S3
   * and returns an array of learning object files.
   * 
   * @returns {Promise<LearningObjectFile[]>} 
   * @memberof UploadComponent
   */
  upload(): Promise<LearningObjectFile[]> {
    var files = this.dzDirectiveRef.dropzone().getAcceptedFiles();
    if (files.length >= 1) {
      this.uploading = true;
      return this.fileStorageService.upload(this.learningObject, files);
    }
    this.uploading = false;
    return Promise.resolve([]);
  }

  /**
   * Sends a list of files to API for deletion 
   * 
   * @returns {Promise<{}[]>} 
   * @memberof UploadComponent
   */
  deleteFiles(): Promise<{}[]> {
    return Promise.all(this.scheduledDeletions.map((file) => {
      return new Promise((resolve, reject) => {
        this.fileStorageService.delete(this.learningObject, file['name'])
          .then(() => {
            resolve('Deleted')
          });
      });
    }));
  }

  ngOnDestroy() {
    this.routeParamSub.unsubscribe();
  }

}
