import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'clark-file-breadcrumb',
  templateUrl: 'file-breadcrumb.component.html',
  styleUrls: ['file-breadcrumb.component.scss']
})
export class FileBreadcrumbComponent implements OnInit {
  @Input()
  paths$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor() {}

  ngOnInit(): void {}

  jumpTo(index: number, root?: boolean) {
    let path;
    if (root) {
      path = [];
    } else {
      path = this.paths$.getValue().slice(0, index + 1);
    }
    if (JSON.stringify(path) !== JSON.stringify(this.paths$.getValue())) {
      this.paths$.next(path);
    }
  }
}
