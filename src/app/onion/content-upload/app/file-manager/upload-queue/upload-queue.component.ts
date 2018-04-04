import {
  Component,
  OnInit,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { LearningObjectFile } from '../../DirectoryTree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { getPaths } from '../../file-functions';

@Component({
  selector: 'upload-queue',
  templateUrl: './upload-queue.component.html',
  styleUrls: ['./upload-queue.component.scss']
})
export class UploadQueueComponent implements OnInit, OnDestroy {
  @Input() queuedUploads$: BehaviorSubject<LearningObjectFile[]>;
  @Input()
  uploading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @Output() upload: EventEmitter<void> = new EventEmitter<void>();
  private subscriptions: Subscription[] = [];
  collapsed: boolean = false;
  files: LearningObjectFile[] = [];
  folders: any[] = [];

  constructor() {}
  ngOnInit(): void {
    this.subscriptions.push(
      this.queuedUploads$.subscribe(() => {
        this.refreshQueue();
      })
    );
  }

  private refreshQueue(): void {
    const queue = this.queuedUploads$.getValue();
    for (const file of queue) {
      if (file.fullPath) {
        const topLevelPath = getPaths(file.fullPath)[0];
        const folderIndex = this.findFile(topLevelPath, this.folders);
        if (folderIndex !== -1) {
          const folder = this.folders[folderIndex];
          if (this.findFile(file.fullPath, folder.contents) === -1) {
            folder.contents.push(file.fullPath);
          }
        } else {
          const folder = {
            name: topLevelPath,
            contents: [file.fullPath]
          };
          this.folders.push(folder);
        }
      } else if (
        !file.fullPath &&
        this.findFile(file.fullPath, this.files) === -1
      ) {
        this.files.push(file);
      }
    }
  }

  private findFile(path: string, array: any[]): number {
    let index = -1;
    for (let i = 0; i < array.length; i++) {
      const file_or_path = array[i];
      if (
        file_or_path.name === path ||
        file_or_path.fullPath === path ||
        path === file_or_path
      ) {
        index = i;
        break;
      }
    }
    return index;
  }

  triggerUpload() {
    this.upload.emit();
  }

  remove(item) {
    const queue = this.queuedUploads$.getValue();
    if (item.contents) {
      for (const path of item.contents) {
        const index = this.findFile(path, queue);
        queue.splice(index, 1);
      }
      const folderIndex = this.findFile(item.name, this.folders);
      this.folders.splice(folderIndex, 1);
      this.queuedUploads$.next(queue);
    } else {
      const index = this.findFile(item.name, queue);
      queue.splice(index, 1);
      this.queuedUploads$.next(queue);
      const fileIndex = this.findFile(item.name, this.files);
      this.files.splice(fileIndex, 1);
    }
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
