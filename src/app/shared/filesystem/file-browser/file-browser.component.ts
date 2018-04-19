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
import {
  DirectoryNode,
  DirectoryTree
} from 'app/shared/filesystem/DirectoryTree';
import { getIcon } from 'app/shared/filesystem/file-icons';

@Component({
  selector: 'clark-file-browser',
  templateUrl: 'file-browser.component.html',
  styleUrls: ['file-browser.component.scss']
})
export class FileBrowserComponent implements OnInit {
  @Input()
  filesystem$: BehaviorSubject<DirectoryTree> = new BehaviorSubject<
    DirectoryTree
  >(null);
  @Output() path: EventEmitter<string> = new EventEmitter<string>();

  private subscriptions: Subscription[] = [];
  currentNode$: BehaviorSubject<DirectoryNode> = new BehaviorSubject<
    DirectoryNode
  >(null);

  currentPath$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor() {}

  ngOnInit(): void {}

  openFolder(path: string) {
    const paths = this.currentPath$.getValue();
    paths.push(path);
    this.currentPath$.next(paths);
    this.refreshNode();
  }

  private refreshNode() {
    const path = this.currentPath$.getValue();
    const filesystem = this.filesystem$.getValue();
    this.currentNode$.next(filesystem.traversePath(path));
    this.path.emit(path.join('/'));
  }
}
