import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@entity';
import { BuilderStore, BUILDER_ACTIONS } from '../../builder-store.service';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { FileUploadMeta } from '../../components/content-upload/app/services/typings';

@Component({
  selector: 'clark-materials-page',
  templateUrl: './materials-page.component.html',
  styleUrls: ['./materials-page.component.scss']
})
export class MaterialsPageComponent implements OnInit, OnDestroy {
  saving$: Subject<boolean> = new Subject<boolean>();
  error$: Subject<string> = new Subject<string>();
  learningObject$: Observable<LearningObject>;
  destroyed$: Subject<void> = new Subject();
  learningObject: LearningObject;
  notes = [
    {
      title: 'Videos',
      content: `Video files uploaded to CLARK will be transferred to our Youtube channel to prevent file corruption or other problems.
       If you prefer to upload your videos to your own Youtube channel then provide links to them in the materials section. 
       If there are no additional revisions, we will proceed with the release and notify you via email if you video content
       needs to be updated in the future.`
    },
    {
      title: 'Solution Files',
      content: `CLARK allows for the upload of solution files. If you do not wish to upload solutions with the 
      learning object, please add a note (in the "notes" section) indicating where the solutions can be found in the learning object.`
    },
    {
      title: 'Malware',
      content: `If you plan to upload malware samples, we will add a file description during the review process to indicate 
      that the file is malware, along with a note about the presence of malware material for downloading users. We encourage 
      you to upload all malware samples in password-protected ZIP files and include the password in the learning object's notes section.`
    },
    {
      title: 'Virtual Machines and other large files',
      content: `If you plan to upload large files (1GB or larger, including VMs, log files, applications, etc.), we ask that you 
      reach out to our team at <a href="editors@secured.team">editors@secured.team</a> for guidance on how to submit your learning object.`
    },
    {
      title: 'Third Party Software',
      content: `If your learning object requires the use of third party software please include a link to any FAQ/Troubleshooting
      resources specific to that software.`
    }];

  constructor(private store: BuilderStore) {}

  ngOnInit() {
    this.learningObject$ = this.store.learningObjectEvent.pipe(
      takeUntil(this.destroyed$)
    );

    this.saving$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe(val => {
      this.store.serviceInteraction$.next(val);
    });

    // listen for outcome events and update component stores
    this.store.learningObjectEvent
    .pipe(
      filter(learningObject => learningObject !== undefined),
      takeUntil(this.destroyed$)
    ).subscribe((payload: LearningObject) => {
      this.learningObject = payload;
    });
  }

  async handleFileDeletion(fileIds: string[]) {
    // Refresh object or materials
    try {
      await this.store.execute(BUILDER_ACTIONS.DELETE_FILES, { fileIds });
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleFilesUploaded(files: FileUploadMeta[]) {
    // Refresh object or materials
    try {
      await this.store.execute(BUILDER_ACTIONS.ADD_FILE_META, { files });
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleUrlAdded() {
    try {
      await this.store.execute(BUILDER_ACTIONS.ADD_URL);
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleUrlUpdated(data: { index: number; url: LearningObject.Material.Url }) {
    try {
      await this.store.execute(BUILDER_ACTIONS.UPDATE_URL, data);
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleUrlRemoved(index: number) {
    try {
      await this.store.execute(BUILDER_ACTIONS.REMOVE_URL, index);
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleFileDescriptionUpdate(fileMeta: {
    id: string;
    description: string;
  }) {
    try {
      await this.store.execute(
        BUILDER_ACTIONS.UPDATE_FILE_DESCRIPTION,
        fileMeta
      );
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleFolderDescriptionUpdate(folderMeta: {
    path?: string;
    index?: number;
    description: string;
  }) {
    try {
      await this.store.execute(
        BUILDER_ACTIONS.UPDATE_FOLDER_DESCRIPTION,
        folderMeta
      );
    } catch (e) {
      this.error$.next(e);
    }
  }

  async handleNotesUpdate(notes: string) {
    try {
      await this.store.execute(BUILDER_ACTIONS.UPDATE_MATERIAL_NOTES, notes);
    } catch (e) {
      this.error$.next(e);
    }
  }

  // Toggle function for exiting builder
  handleUploadComplete(val: string) {
    this.store.toggleUploadComplete(val);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
