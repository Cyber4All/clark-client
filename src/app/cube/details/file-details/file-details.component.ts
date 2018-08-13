import { Component, OnInit, Input } from '@angular/core';
import {
  DirectoryTree,
  DirectoryNode
} from '../../../shared/filesystem/DirectoryTree';
import { Material } from '@cyber4all/clark-entity/dist/learning-object';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'onion-file-details',
  templateUrl: 'file-details.component.html',
  styleUrls: ['file-details.component.scss']
})
export class FileDetailsComponent implements OnInit {
  @Input() length: string;
  @Input() materials: Material;

  files$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  folderMeta$: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor() {}

  ngOnInit() {
    const files = this.materials.files;
    const folderMeta = this.materials['folderDescriptions'];
    this.files$.next(files);
    this.folderMeta$.next(folderMeta);
  }
}
