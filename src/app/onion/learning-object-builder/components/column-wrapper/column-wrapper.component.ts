import { Component, OnInit, ContentChild, ElementRef, AfterViewInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { MessagesService } from 'app/core/messages.service';

@Component({
  selector: 'clark-column-wrapper',
  templateUrl: './column-wrapper.component.html',
  styleUrls: ['./column-wrapper.component.scss'],
})
export class ColumnWrapperComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('columnWrapper') columnWrapper: ElementRef;

  @Input() columns = 'lmr';

  messageBar: boolean;

  columnOffset: number;
  columnHeight: number;

  constructor(private messagesService: MessagesService) {}

  async ngOnInit() {
    this.messageBar = !!(await this.messagesService.getStatus());

    // calculate the height of the scroll wrapper
    this.columnOffset = (this.columnWrapper.nativeElement as HTMLElement).offsetTop;
    this.columnHeight = window.innerHeight - this.columnOffset - (this.messageBar ? (document.querySelector('clark-message .wrapper') as HTMLElement).offsetHeight : 0) + 30; // this +30 offsets the wrappers -30 offset

    // set overflow of body to hidden to prevent parent scrolling
    if (this.columnHeight >= 560) {
      // this check prevents obsucring the outcomes sidebar
      document.body.style.overflow = 'hidden';
    }
  }

  ngAfterViewInit() {
    // TODO check for right column and adjust mobile threshold here
    // TODO collapse left panel on smaller screens
  }

  get rightColumn(): boolean {
    return this.columns.indexOf('r') >= 0;
  }

  get leftColumn(): boolean {
    return this.columns.indexOf('l') >= 0;
  }

  showColumn(value: 'l' | 'm' | 'r'): boolean {
    return this.columns.indexOf(value) >= 0;
  }

  ngOnDestroy() {
    document.body.style.overflow = 'visible';
  }
}
