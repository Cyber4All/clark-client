import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { DirectoryNode } from 'app/shared/filesystem/DirectoryTree';
import { getIcon } from 'app/shared/filesystem/file-icons';

@Component({
  selector: 'clark-file-list-view',
  templateUrl: 'file-list-view.component.html',
  styleUrls: ['file-list-view.component.scss']
})
export class FileListViewComponent implements OnInit {
  @Input()
  node$: BehaviorSubject<DirectoryNode> = new BehaviorSubject<DirectoryNode>(
    null
  );
  @Output() emitPath: EventEmitter<string> = new EventEmitter<string>();

  getIcon = (extension: string) => getIcon(extension);

  constructor() {}

  ngOnInit(): void {}

  openFolder(path: string): void {
    this.emitPath.emit(path);
  }
}
