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
import { DirectoryNode } from '../DirectoryTree';
import { getIcon } from '../file-icons';

@Component({
  selector: 'clark-file-grid-view',
  templateUrl: 'file-grid-view.component.html',
  styleUrls: ['file-grid-view.component.scss']
})
export class FileGridViewComponent implements OnInit {
  @Input() canManage = false;

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
