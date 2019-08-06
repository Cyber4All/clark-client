import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { COPY } from './file-details.copy';
import { LearningObject } from '@entity';

@Component({
  selector: 'onion-file-details',
  templateUrl: 'file-details.component.html',
  styleUrls: ['file-details.component.scss']
})
export class FileDetailsComponent implements OnInit, OnChanges {
  copy = COPY;
  @Input() length: string;
  @Input() materials: LearningObject.Material;

  files$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  folderMeta$: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  constructor() {}

  /**
   * Emits files and folder metadata provided by the component input to subscribers.
   *
   * @memberof FileDetailsComponent
   */
  emit(): void {
    const files = this.materials.files;
    const folderMeta = this.materials.folderDescriptions;
    this.files$.next(files);
    this.folderMeta$.next(folderMeta);
  }

  ngOnInit(): void {
    this.emit();
  }

  ngOnChanges(): void {
    this.emit();
  }
}
