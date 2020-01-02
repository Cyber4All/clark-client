import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { LearningObject } from '@entity';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'clark-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit, OnChanges {

  @Input() materials: LearningObject.Material;

  files$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  folderMeta$: BehaviorSubject<any> = new BehaviorSubject<any>([]);

  currentSelection: 'Files' | 'URLs' | 'Notes' = 'Files';

  setSelection(currentSelection: 'Files' | 'URLs' | 'Notes') {
    this.currentSelection = currentSelection;
  }

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
