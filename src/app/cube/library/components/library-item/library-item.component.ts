import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { LearningObject } from 'entity/learning-object/learning-object';
import { LibraryService } from 'app/core/library.service';

@Component({
  selector: 'clark-library-item',
  templateUrl: './library-item.component.html',
  styleUrls: ['./library-item.component.scss']
})
export class LibraryItemComponent implements OnInit {

  @Input() learningObject: LearningObject;
  @Input() learningObjectAverageRating: number;
  @Input() load: [];
  @Input() currIndex: number;
  @Input() myIndex: number;

  @Output() downloadButtonClicked = new EventEmitter<Event>();
  @Output() deleteButtonClicked = new EventEmitter<Event>();
  @Output() titleClicked = new EventEmitter<Event>();

  toggle = false;

  constructor(private libraryService: LibraryService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.libraryService.loaded.subscribe(val => {
      this.toggle = val;
      this.changeDetectorRef.markForCheck();
    });
  }

  onDownloadClick(e: Event) {
    this.downloadButtonClicked.emit(e);
    this.changeDetectorRef.detectChanges();
  }

  onDeleteButtonClick(e: Event) {
    this.deleteButtonClicked.emit(e);
  }

  onTitleClick(e: Event) {
    this.titleClicked.emit(e);
  }

  toggleDownload() {
    if (this.toggle) {
      if (this.currIndex === this.myIndex) {
        return '<i class="fal fa-spinner-third fa-spin"></i>';
      } else {
        return '<i class="far fa-download"></i>';
      }
    } else {
      return '<i class="far fa-download"></i>';
    }
  }

  getContributorsList() {
    let attribution = '';
    // Creates the attribution string: 'a' or 'a and # of other contributor(s)'
    if (this.learningObject.contributors && this.learningObject.contributors.length > 0) {
      attribution = this.capitalizeName(this.learningObject.contributors[0].name);
      if (this.learningObject.contributors.length > 1) {
        attribution += ' and ' + (this.learningObject.contributors.length - 1)
        + ' other contributor' + (this.learningObject.contributors.length > 2 ? 's' : '');
      }
    } else {
      attribution = 'No contributors';
    }
    return attribution;
  }

  private capitalizeName(name) {
    return name.replace(/\b(\w)/g, s => s.toUpperCase());
  }
}
