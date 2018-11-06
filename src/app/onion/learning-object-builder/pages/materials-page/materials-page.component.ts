import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { BuilderStore, BUILDER_ACTIONS } from '../../builder-store.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import { Url } from '@cyber4all/clark-entity/dist/learning-object';

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

  constructor(private store: BuilderStore) {}

  ngOnInit() {
    this.learningObject$ = this.store.learningObjectEvent.pipe(
      takeUntil(this.destroyed$)
    );
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

  async handleFileDeletion() {
    // Refresh object or materials
    console.log('FILES DELETED');
  }

  async handleUploadComplete() {
    // Refresh object or materials
    console.log('UPLOAD COMPLETE');
  }

  handleUrlAdded() {
    this.store.execute(BUILDER_ACTIONS.ADD_URL);
  }

  handleUrlUpdated(data: { index: number; url: Url }) {
    this.store.execute(BUILDER_ACTIONS.UPDATE_URL, data);
  }

  handleUrlRemoved(index: number) {
    this.store.execute(BUILDER_ACTIONS.REMOVE_URL, index);
  }

  handleFileDescriptionUpdate(fileMeta: { id: string; description: string }) {
    this.store.execute(BUILDER_ACTIONS.UPDATE_FILE_DESCRIPTION, fileMeta);
  }
  handleFolderDescriptionUpdate(folderMeta: {
    path?: string;
    index?: number;
    description: string;
  }) {
    this.store.execute(BUILDER_ACTIONS.UPDATE_FOLDER_DESCRIPTION, folderMeta);
  }

  handleNotesUpdate(notes: string) {
    this.store.execute(BUILDER_ACTIONS.UPDATE_MATERIAL_NOTES, notes);
  }
}
