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
