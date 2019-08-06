import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'clark-file-breadcrumb',
  templateUrl: 'file-breadcrumb.component.html',
  styleUrls: ['file-breadcrumb.component.scss']
})
export class FileBreadcrumbComponent implements OnInit {
  @Input()
  paths: string[] = [];

  @Output() pathChanged: EventEmitter<string[]> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  jumpTo(index: number, root?: boolean) {
    let path;
    if (root) {
      path = [];
    } else {
      path = this.paths.slice(0, index + 1);
    }
    if (JSON.stringify(path) !== JSON.stringify(this.paths)) {
      this.paths = path;
      this.pathChanged.emit(this.paths);
    }
  }
}
