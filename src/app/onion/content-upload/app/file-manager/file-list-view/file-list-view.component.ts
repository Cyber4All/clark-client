import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { DirectoryNode } from '../../shared/DirectoryTree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { getIcon } from '../file-icons';

@Component({
  selector: 'file-list-view',
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
