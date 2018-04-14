import { Component, OnInit, Input } from '@angular/core';
import { File } from '@cyber4all/clark-entity/dist/learning-object';
import { getIcon } from 'app/shared/filesystem/file-icons';
type LearningObjectFile = File;

@Component({
  selector: 'cube-file-view',
  templateUrl: 'file-view.component.html',
  styleUrls: ['file-view.component.scss']
})
export class FileViewComponent implements OnInit {
  @Input() file: LearningObjectFile;
  getIcon = (extension: string) => getIcon(extension);

  constructor() {}

  ngOnInit() {}
}
