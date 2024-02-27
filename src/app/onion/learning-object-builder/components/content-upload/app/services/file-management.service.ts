import * as AWS from 'aws-sdk';

import { Injectable } from '@angular/core';
import { USER_ROUTES } from '@env/route';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { retry, catchError, takeUntil } from 'rxjs/operators';
import { throwError, Subject, Observable } from 'rxjs';
import { LearningObject } from '@entity';
import { environment } from '@env/environment';
import { FileInput } from '../upload/upload.component';
import { AuthService, OpenIdToken } from 'app/core/auth-module/auth.service';
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
import { UserService } from 'app/core/user-module/user.service';

const DEFAULT_CONCURRENT_UPLOADS = 10;

@Injectable({
  providedIn: 'root'
})
export class FileManagementService {
  private S3: AWS.S3;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private userService: UserService
  ) { }

  /**
   * Uploads files to S3 using S3 SDK
   *
   * @param {string} authorUsername [The username of the Learning Object's author]
   * @param {string} learningObjectId [The id of the Learning Object]
   * @param {number} learningObjectRevisionId [The revision id of the Learning Object]
   * @param {FileInput[]} files [List of files to upload]
   * @returns {Observable<UploadUpdate>}
   * @memberof FileManagementService
   */
  upload({
    authorUsername,
    learningObjectCuid,
    learningObjectRevisionId,
    files
  }: {
    authorUsername: string;
    learningObjectCuid: string;
    learningObjectRevisionId: number;
    files: FileInput[];
  }): Observable<UploadUpdate> {
    this.validateFileNames(files, learningObjectCuid);
    this.validateUploadParams({
      authorUsername,
      learningObjectId: learningObjectCuid,
      learningObjectRevisionId
    });
    this.configureS3Client();
    const uploadUpdate$ = new Subject<UploadUpdate>();
    this.getCognitoIdentityId(authorUsername)
      .then(cognitoIdentityId => {
        const bucketPath = `${cognitoIdentityId}/${learningObjectCuid}/${learningObjectRevisionId}`;
        this.startUploads(files, bucketPath, uploadUpdate$);
      })
      .catch(e => {
        uploadUpdate$.next({ type: 'error', data: e });
      });
    return uploadUpdate$;
  }

  /**
   * Validates that all the files to be uploaded don't include the bundle zip name
   *
   * @param files The files to check
   * @param cuid The cuid of the file
   */
  private validateFileNames(files: FileInput[], cuid: string) {
    files.forEach(file => {
      if (file.name === `${cuid}.zip`) {
        throw new Error(`Cannot upload file with name ${cuid}.zip because this is a reserved file name`);
      }
    });
  }

  /**
   * Checks if required parameters for starting an upload are provided
   * If a parameter is missing, an error is thrown
   *
   * @private
   * @param {string} authorUsername [The username of the Learning Object's author]
   * @param {string} learningObjectId [The id of the Learning Object]
   * @param {number} learningObjectRevisionId [The revision id of the Learning Object]
   * @memberof FileManagementService
   */
  private validateUploadParams({
    authorUsername,
    learningObjectId,
    learningObjectRevisionId
  }: {
    authorUsername: string;
    learningObjectId: string;
    learningObjectRevisionId: number;
  }) {
    if (!authorUsername) {
      throw new Error(
        'Cannot start upload. Learning Object\'s author\'s username must be provided.'
      );
    }
    if (!learningObjectId) {
      throw new Error(
        'Cannot start upload. Learning Object\'s id must be provided.'
      );
    }
    if (learningObjectRevisionId == null) {
      throw new Error(
        'Cannot start upload. Learning Object\'s revision id must be provided.'
      );
    }
  }

  /**
   * Retrieves Cognito Identity Id for the given user
   *
   * @private
   * @param {string} username [The username to retrieve the associated Cognito Identity Id forI]
   * @returns {Promise<string>}
   * @memberof FileManagementService
   */
  private async getCognitoIdentityId(username: string): Promise<string> {
    let cognitoIdentityId;
    if (username !== this.auth.user.username && !this.auth.isAdminOrEditor()) {
      throw new Error(
        `Invalid access. You do not have permission to upload files for ${username}.`
      );
    }
    if (username === this.auth.user.username) {
      cognitoIdentityId = this.auth.getOpenIdToken().IdentityId;
    } else {
      // Get user data and return cognito id
      const user = await this.userService.getUser(username, 'username');
      cognitoIdentityId = user.cognitoIdentityId;
    }
    if (!cognitoIdentityId) {
      throw new Error(
        `Cannot start upload. Unable to get upload location for ${username}.`
      );
    }
    return cognitoIdentityId;
  }

  /**
   * Configures S3 Sdk for upload using user's Cognito credentials
   *
   * @private
   * @memberof FileManagementService
   */
  private configureS3Client(): void {
    const openIdToken: OpenIdToken = this.auth.getOpenIdToken();
    if (!openIdToken) {
      const credentialsError = new Error();
      credentialsError.name = UploadErrorReason.Credentials;
      throw credentialsError;
    }
    const Logins = {
      'cognito-identity.amazonaws.com': openIdToken.Token
    };
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
   * @param {FileInput[]} files [List of files to upload]
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {number} maxConcurrentUploads [Maximum number of concurrent uploads]
   * @memberof FileManagementService
   */
  private async startUploads(
    files: FileInput[],
    bucketPath: string,
    uploadUpdate$: Subject<UploadUpdate>,
    maxConcurrentUploads?: number
  ) {
    const maxConcurrent = maxConcurrentUploads || DEFAULT_CONCURRENT_UPLOADS;
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
   * Jobs are enqueued and processed; Once a job in the spliced segment is completed, more jobs are enqueued based on the remaining space
   * This event loop stops when all files are processed
   * *** NOTE ***
   * The maximum number of files to upload concurrently are dependent on the value of `maxConcurrentUploads`
   * `proceessNext.next()` Initiates the start of the job queue
   *
   * @private
   * @param {FileInput[]} files [List of files to upload]
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {QueueStatus} queueStatus [Object containing counters related to status of the queue]
   * @param {number} maxConcurrentUploads [The maximum amount of files to upload concurrently]
   * @memberof FileManagementService
   */
  private processUploadQueue(
    files: FileInput[],
    bucketPath: string,
    uploadUpdate$: Subject<UploadUpdate>,
    queueStatus: QueueStatus,
    maxConcurrentUploads: number
  ) {
    const enqueueStatus: EnqueueStatus = {
      enqueued: 0
    };
    const jobsComplete$ = new Subject<boolean>();
    const processNext$ = new Subject<void>();
    processNext$.pipe(takeUntil(jobsComplete$)).subscribe(() => {
      const remainingQueueSpace = maxConcurrentUploads - enqueueStatus.enqueued;
      files.splice(0, remainingQueueSpace).forEach(file => {
        this.startUpload(
          file,
          bucketPath,
          queueStatus,
          enqueueStatus,
          uploadUpdate$,
          jobsComplete$,
          processNext$
        );
      });
    });
    // Start processing uploads
    processNext$.next();
  }

  /**
   * Starts upload to S3 using S3 SDK to upload
   * Upload progress and responses are reported
   *
   * @private
   * @param {FileInput} file [The file to upload]
   * @param {string} bucketPath [The path within the bucket to upload files to]
   * @param {QueueStatus} queueStatus [Object containing counters related to status of the queue]
   * @param {EnqueueStatus} enqueueStatus [Object containing counters related to status of the enqueued queue]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {Subject<boolean>} jobsComplete$ [Observable used to signal that the entire queue has been processed]
   * @param {Subject<void>} processNext$ [Observable used to signal another upload job can be started]
   * @memberof FileManagementService
   */
  private startUpload(
    file: FileInput,
    bucketPath: string,
    queueStatus: QueueStatus,
    enqueueStatus: EnqueueStatus,
    uploadUpdate$: Subject<UploadUpdate>,
    jobsComplete$: Subject<boolean>,
    processNext$: Subject<void>
  ) {
    const fileMeta: FileUploadMeta = this.generateFileUploadMeta(file);
    const params: AWS.S3.Types.PutObjectRequest = this.generateUploadParams(
      bucketPath,
      file
    );
    // Upload started; Increment number of enqueued uploads
    enqueueStatus.enqueued++;
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
  }

  /**
   * Generates FileUploadMeta for a file
   *
   * @private
   * @param {FileInput} file [The file to generate FileUploadMeta for]
   * @returns {FileUploadMeta}
   * @memberof FileManagementService
   */
  private generateFileUploadMeta(file: FileInput): FileUploadMeta {
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
   * @param {FileInput} file [The file to generate upload params for]
   * @returns {AWS.S3.PutObjectRequest}
   * @memberof FileManagementService
   */
  private generateUploadParams(
    bucketPath: string,
    file: FileInput
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
   * @param {EnqueueStatus} enqueueStatus [Object containing counters related to status of the enqueued queue]
   * @param {Subject<UploadUpdate>} uploadUpdate$ [Observable used to report upload updates]
   * @param {Subject<boolean>} jobsComplete$ [Observable used to signal that the entire queue has been processed]
   * @param {Subject<void>} processNext$ [Observable used to signal another upload job can be started]
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
    enqueueStatus.enqueued--;
    if (queueStatus.remaining === 0) {
      this.handleQueueComplete(jobsComplete$, uploadUpdate$, queueStatus);
    } else {
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
   * @param {Subject<boolean>} jobsComplete$ [Observable used to signal that the entire queue has been processed]
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
    const route = USER_ROUTES.DELETE_FILE_FROM_LEARNING_OBJECT({
      authorUsername: learningObject.author.username,
      learningObjectId: learningObject.id,
      fileId
    });

    return this.http
      .delete(route, { withCredentials: true, responseType: 'text' })
      .pipe(

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
