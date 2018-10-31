import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '@cyber4all/clark-entity';
import { BuilderStore, BUILDER_ACTIONS } from '../../builder-store.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';

@Component({
  selector: 'clark-materials-page',
  templateUrl: './materials-page.component.html',
  styleUrls: ['./materials-page.component.scss']
})
export class MaterialsPageComponent implements OnInit, OnDestroy {
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
    console.log('FILES DELETED');
  }

  async handleUploadComplete() {
    console.log('UPLOAD COMPLETE');
    const object = await this.learningObject$.take(1).toPromise();
    const name = object.name;
    // this.learningObject$ = this.store.fetch(name);
  }

  handleUrlAdded() {
    this.store.execute(BUILDER_ACTIONS.ADD_URL);
  }

  handleUrlRemoved() {
    this.store.execute(BUILDER_ACTIONS.REMOVE_URL);
  }

  handleFileDescriptionUpdate(fileMeta: { id: string; description: string }) {
    this.store.execute(BUILDER_ACTIONS.UPDATE_FILE_DESCRIPTION, fileMeta);
  }
  handleFolderDescriptionUpdate(folderMeta: {
    index: number;
    description: string;
  }) {
    this.store.execute(BUILDER_ACTIONS.UPDATE_FOLDER_DESCRIPTION, folderMeta);
  }

  handleNotesUpdate(notes: string) {
    this.store.execute(BUILDER_ACTIONS.UPDATE_MATERIAL_NOTES, notes);
  }
}
