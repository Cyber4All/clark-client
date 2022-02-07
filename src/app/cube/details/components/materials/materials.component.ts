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

  previousSelection: string;

  currentSelection: 'Files' | 'URLs' | 'Notes' = 'Files';

  carouselPosition = {
    Files: 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    URLs: 1,
    Notes: 2,
  };

  action$: BehaviorSubject<number> = new BehaviorSubject(0);

  files$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  folderMeta$: BehaviorSubject<any> = new BehaviorSubject<any>([]);


  setSelection(newSelection: 'Files' | 'URLs' | 'Notes') {
    this.previousSelection = this.currentSelection;
    this.currentSelection = newSelection;
    this.rotateCarousel();
  }

  rotateCarousel() {
    const previousPosition = this.carouselPosition[this.previousSelection];
    const currentPosition = this.carouselPosition[this.currentSelection];
    const movementLength = currentPosition - previousPosition;
    this.action$.next(movementLength);
  }

  // files and folderDescription inputs are passed
  // to the behavior subjects. Angular output
  // events are not emitted here.
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
