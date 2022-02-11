import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { LearningObject } from '@entity';


@Component({
  selector: 'clark-url-row',
  templateUrl: './url-row.component.html',
  styleUrls: ['./url-row.component.scss']
})

export class UrlRowComponent implements OnInit {

  titleText: string;
  urlLink: string;
  @Input() addNew: boolean;
  @Input()
  url: LearningObject.Material.Url = {
    title: '',
    url: ''
  };
  @Input()
  index = 0;

  @Output()
  updateUrl: EventEmitter<{}> = new EventEmitter();
  constructor() {

  }
  ngOnInit() {

    if (this.url.title) {
      this.titleText = this.url.title;
    }
    if (this.url.url) {
      this.urlLink = this.url.url;
    }

    if (this.url.title === '' && this.url.url === '') {
      this.updateUrl.emit({index: this.index, title: this.titleText, url: this.urlLink, addNew: false, focusMe: true});
    }
  }
  /**
   * Accepts a title object that only emits to the parent component
   * if the title input field is not empty
   *
   * @param title
   */
  updateTitle() {
    if (this.titleText !== '' && this.urlLink !== '') {
      if (this.urlLink.includes('https://') || this.urlLink.includes('http://')) {
        this.updateUrl.emit({ index: this.index, title: this.titleText, url: this.urlLink, addNew: true, focusMe: false});
      } else {
        this.updateUrl.emit({index: this.index, title: this.titleText, url: this.urlLink, addNew: false, focusMe: false});
      }
    }
  }

  /**
   * Accepts the url object that only emits to the parent component
   * if the url field isn't empty and is a valid URL
   *
   * @param url
   */
  updateLink() {
    if (this.urlLink !== '' && this.titleText !== '') {
      if (this.urlLink.includes('https://') || this.urlLink.includes('http://')) {
        this.updateUrl.emit({ index: this.index, title: this.titleText, url: this.urlLink, addNew: true, focusMe: false});
      } else {
        this.updateUrl.emit({index: this.index, title: this.titleText, url: this.urlLink, addNew: false, focusMe: false});
      }
    }
  }
}
