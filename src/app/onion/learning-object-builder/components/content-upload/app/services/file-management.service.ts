import * as AWS from 'aws-sdk';

import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError, takeUntil } from 'rxjs/operators';
import { throwError, Subject, Observable } from 'rxjs';
import { LearningObject } from '@entity';
import { environment } from '@env/environment';
import { WebkitFile } from '../upload/upload.component';
import { AuthService, OpenIdToken } from 'app/core/auth.service';
import {
  UploadUpdate,
  QueueStatus,
  EnqueueStatus,
  FileUploadMeta,
  UploadCompleteUpdate,
  UploadProgressUpdate,
  UploadErrorReason,
  UploadErrorUpdate
} from './typings';

const DEFAULT_CONCURRENT_UPLOADS = 10;

@Injectable()
export class FileManagementService {
  private S3: AWS.S3;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /**
   * Uploads files to S3 using S3 SDK
   *
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {WebkitFile[]} files [List of files to upload]
   * @returns {Observable<UploadUpdate>}
   * @memberof FileManagementService
   */
  upload(bucketPath: string, files: WebkitFile[]): Observable<UploadUpdate> {
    if (!bucketPath) {
      throw new Error('bucketPath must be set!');
    }
    this.configureS3Client();
    const uploadUpdate$ = new Subject<UploadUpdate>();
    this.startUploads(files, bucketPath, uploadUpdate$);
    return uploadUpdate$;
  }

  /**
   * Configures S3 Sdk for upload using user's Cognito credentials
   *
   * @private
   * @memberof FileManagementService
   */
  private configureS3Client() {
    const openIdToken: OpenIdToken = this.auth.getOpenIdToken();
    if (!openIdToken) {
      const credentialsError = new Error();
      credentialsError.name = UploadErrorReason.Credentials;
      throw credentialsError;
    }
    const Logins = {};
    Logins['cognito-identity.amazonaws.com'] = openIdToken.Token;
    const IdentityPoolId = this.auth.isAdminOrEditor()
      ? environment.cognitoAdminIdentityPoolId
      : environment.cognitoIdentityPoolId;
    const IdentityId = openIdToken.IdentityId;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(
      {
        IdentityPoolId,
        IdentityId,
        Logins
      },
      { region: environment.cognitoRegion }
    );
    this.S3 = new AWS.S3({ region: environment.s3BucketRegion });
  }

  /**
   * Initializes counter object to track queue status and processes upload queue
   *
   * @private
   * @param {WebkitFile[]} files [List of files to upload]
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {number} concurrentUploads [Maximum number of concurrent uploads]
   * @memberof FileManagementService
   */
  private async startUploads(
    files: WebkitFile[],
    bucketPath: string,
    uploadUpdate$: Subject<UploadUpdate>,
    concurrentUploads?: number
  ) {
    const maxConcurrent = concurrentUploads || DEFAULT_CONCURRENT_UPLOADS;
    const queueStatus: QueueStatus = {
      successful: 0,
      failed: 0,
      remaining: files.length
    };
    this.processUploadQueue(
      files,
      bucketPath,
      uploadUpdate$,
      queueStatus,
      maxConcurrent
    );
  }

  /**
   * Processes upload queue by creating observables to listen for events to trigger the processing of next jobs
   * Jobs are enqueued and processed; Once spliced segment is completed, another segment is processed;
   * This event loop stops when all files are processed
   * *** NOTE ***
   * The maximum number of files to upload concurrently are dependent on the value of `concurrentUploads`
   * `proceessNext.next()` Initiates the start of the job queue
   *
   * @private
   * @param {WebkitFile[]} files [List of files to upload]
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {QueueStatus} queueStatus [Object containing counters related to status of the queue]
   * @param {number} concurrentUploads [The maximum amount of files to upload concurrently]
   * @memberof FileManagementService
   */
  private processUploadQueue(
    files: WebkitFile[],
    bucketPath: string,
    uploadUpdate$: Subject<UploadUpdate>,
    queueStatus: QueueStatus,
    concurrentUploads: number
  ) {
    const jobsComplete$ = new Subject<boolean>();
    const processNext$ = new Subject<void>();
    processNext$.pipe(takeUntil(jobsComplete$)).subscribe(() => {
      const enqueued = files.splice(0, concurrentUploads);
      this.processUploadJobs(
        enqueued,
        bucketPath,
        uploadUpdate$,
        queueStatus,
        jobsComplete$,
        processNext$
      );
    });
    // Start processing uploads
    processNext$.next();
  }

  /**
   * Processes enqueued files using S3 to upload
   * Upload progress and responses are reported
   *
   * @private
   * @param {WebkitFile[]} enqueued [List of files enqueued to upload]
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {QueueStatus} queueStatus [Object containing counters related to status of the queue]
   * @param {Subject<boolean>} jobsComplete$ [Observable indicating whether or not all files in the upload queue have been completed]
   * @param {Subject<void>} processNext$ [Observable used to trigger next set of upload jobs on current job's completion]
   * @memberof FileManagementService
   */
  private processUploadJobs(
    enqueued: WebkitFile[],
    bucketPath: string,
    uploadUpdate$: Subject<UploadUpdate>,
    queueStatus: QueueStatus,
    jobsComplete$: Subject<boolean>,
    processNext$: Subject<void>
  ) {
    const enqueueStatus: EnqueueStatus = {
      remaining: enqueued.length
    };
    enqueued.forEach(file => {
      const fileMeta: FileUploadMeta = this.generateFileUploadMeta(file);
      const params: AWS.S3.Types.PutObjectRequest = this.generateUploadParams(
        bucketPath,
        file
      );
      this.S3.upload(params, (err: Error, res: AWS.S3.ManagedUpload.SendData) =>
        this.handleUploadResponse(
          err,
          res,
          fileMeta,
          queueStatus,
          enqueueStatus,
          uploadUpdate$,
          jobsComplete$,
          processNext$
        )
      ).on('httpUploadProgress', evt => {
        this.reportProgress(fileMeta, evt, uploadUpdate$);
      });
    });
  }

  /**
   * Generates FileUploadMeta for a file
   *
   * @private
   * @param {WebkitFile} file [The file to generate FileUploadMeta for]
   * @returns {FileUploadMeta}
   * @memberof FileManagementService
   */
  private generateFileUploadMeta(file: WebkitFile): FileUploadMeta {
    return {
      name: file.name,
      fileType: file.type,
      fullPath: file.fullPath || file.webkitRelativePath || file.name,
      size: file.size
    };
  }

  /**
   * Generates upload params for file
   *
   * @private
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {WebkitFile} file [The file to generate upload params for]
   * @returns {AWS.S3.PutObjectRequest}
   * @memberof FileManagementService
   */
  private generateUploadParams(
    bucketPath: string,
    file: WebkitFile
  ): AWS.S3.PutObjectRequest {
    return {
      Bucket: environment.s3Bucket,
      Key:
        bucketPath +
        '/' +
        (file.fullPath || file.webkitRelativePath || file.name),
      ContentType: file.type,
      Body: file
    };
  }

  /**
   * Handles response from S3 SDK by handling error or handling the completion of a file
   * A response from S3 via the callback means that the upload has finish processing,
   * So the `remaining` property is decremented in both `queueStatus` and `enqueueStatus`
   * If this was the last file in the queue; Queue completion is handled
   * If this was the last file in the enqueued queue; This function will signal that another job can start
   *
   * @private
   * @param {Error} err [Error object from S3 SDK]
   * @param {AWS.S3.ManagedUpload.SendData} res [Response data from S3 SDK]
   * @param {FileUploadMeta} fileMeta [Metadata about the file processed]
   * @param {QueueStatus} queueStatus [Object containing counters related to status of the queue]
   * @param {EnqueueStatus} queueStatus [Object containing counters related to status of the enqueued queue]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {Subject<boolean>} jobsComplete$ [Observable indicating whether or not all files in the upload queue have been completed]
   * @param {Subject<void>} processNext$ [Observable used to trigger next set of upload jobs on current job's completion]
   * @memberof FileManagementService
   */
  private handleUploadResponse(
    err: Error,
    res: AWS.S3.ManagedUpload.SendData,
    fileMeta: FileUploadMeta,
    queueStatus: QueueStatus,
    enqueueStatus: EnqueueStatus,
    uploadUpdate$: Subject<UploadUpdate>,
    jobsComplete$: Subject<boolean>,
    processNext$: Subject<void>
  ) {
    if (err) {
      this.handleUploadError(err, fileMeta, queueStatus, uploadUpdate$);
    } else {
      this.handleFileComplete(fileMeta, res, uploadUpdate$, queueStatus);
    }
    queueStatus.remaining--;
    if (queueStatus.remaining === 0) {
      this.handleQueueComplete(jobsComplete$, uploadUpdate$, queueStatus);
    }
    enqueueStatus.remaining--;
    if (enqueueStatus.remaining === 0) {
      processNext$.next();
    }
  }

  /**
   * Reports progress of an upload by emitting UploadProgressUpdate
   *
   * @private
   * @param {FileUploadMeta} fileMeta [Metadata about the file being uploaded]
   * @param {AWS.S3.ManagedUpload.Progress} evt [Progress event from S3 SDK]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @memberof FileManagementService
   */
  private reportProgress(
    fileMeta: FileUploadMeta,
    evt: AWS.S3.ManagedUpload.Progress,
    uploadUpdate$: Subject<UploadUpdate>
  ) {
    const progress: UploadProgressUpdate = {
      type: 'progress',
      data: {
        ...fileMeta,
        progress: (evt.loaded / evt.total) * 100,
        totalUploaded: evt.loaded
      }
    };
    uploadUpdate$.next(progress);
  }

  /**
   * Handles errors that occur when uploading file
   * If error is Credential related; Error is thrown to prevent upload attempts from continuing
   * All errors are emitted through uploadUpdate
   * Increments `failed` counter in queue status
   *
   * @private
   * @param {Error} err [The Error object]
   * @param {FileUploadMeta} fileMeta [Metadata about the file being uploaded during error]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Subject used to emit Upload Error Update]
   * @memberof FileManagementService
   */
  private handleUploadError(
    err: Error,
    fileMeta: FileUploadMeta,
    queueStatus: QueueStatus,
    uploadUpdate$: Subject<UploadUpdate>
  ) {
    if (err.name === UploadErrorReason.Credentials) {
      const credentialsErrorUpdate: UploadErrorUpdate = {
        type: 'error',
        error: err,
        data: fileMeta
      };
      uploadUpdate$.next(credentialsErrorUpdate);
      throw err;
    }
    const errorUpdate: UploadErrorUpdate = {
      type: 'error',
      error: err,
      data: fileMeta
    };
    queueStatus.failed++;
    uploadUpdate$.next(errorUpdate);
  }

  /**
   * Handles the completion of a file upload by emitting an UploadCompleteUpdate and incrementing `successful` counter in queue status
   *
   * @private
   * @param {FileUploadMeta} fileMeta [Metadata about the file processed]
   * @param {AWS.S3.ManagedUpload.SendData} res [Data response from the S3 SDK]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {QueueStatus} queueStatus [Object containing counters related to status of the queue]
   * @memberof FileManagementService
   */
  private handleFileComplete(
    fileMeta: FileUploadMeta,
    res: AWS.S3.ManagedUpload.SendData,
    uploadUpdate$: Subject<UploadUpdate>,
    queueStatus: QueueStatus
  ) {
    const complete: UploadCompleteUpdate = {
      type: 'complete',
      data: { ...fileMeta, url: res.Location, eTag: res.ETag }
    };
    uploadUpdate$.next(complete);
    queueStatus.successful++;
  }

  /**
   * Handles file upload queue completion by:
   * Signaling that all file upload jobs have been completed; Removing subscription to this observable
   * Emitting an UploadQueueCompleteUpdate
   *
   * @private
   * @param {Subject<boolean>} jobsComplete$ [Observable indicating whether or not all files in the upload queue have been completed]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {QueueStatus} queueStatus [Object containing counters related to status of the queue]
   * @memberof FileManagementService
   */
  private handleQueueComplete(
    jobsComplete$: Subject<boolean>,
    uploadUpdate$: Subject<UploadUpdate>,
    queueStatus: QueueStatus
  ) {
    jobsComplete$.next(true);
    jobsComplete$.unsubscribe();
    uploadUpdate$.next({
      type: 'queueComplete',
      data: {
        successful: queueStatus.successful,
        failed: queueStatus.failed
      }
    });
  }

  /**
   * Deletes specified from Learning Object using CLARK API
   *
   * @param {string} learningObjectID
   * @param {string} filename
   * @returns {Promise<{}>}
   * @memberof FileManagementService
   */
  delete(learningObject: LearningObject, fileId: string): Promise<{}> {
    const route = USER_ROUTES.DELETE_FILE_FROM_LEARNING_OBJECT(
      learningObject.author.username,
      learningObject.id,
      fileId
    );

    return this.http
      .delete(route, { withCredentials: true, responseType: 'text' })
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
      .toPromise();
  }

  private handleError(error: HttpErrorResponse) {
    if (
      error.error instanceof ErrorEvent ||
      (error.error && error.error.message)
    ) {
      // Client-side or network returned error
      return throwError(error.error.message);
    } else {
      // API returned error
      return throwError(error);
    }
  }
}
