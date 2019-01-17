import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Url } from '@cyber4all/clark-entity/dist/learning-object';


@Component({
  selector: 'clark-url-row',
  templateUrl: './url-row.component.html',
  styleUrls: ['./url-row.component.scss']
})

export class UrlRowComponent implements OnInit {

  titleText: string;
  urlLink: string;
  @Input()
  url: Url = {
    title: '',
    url: ''
  };
  @Input()
  index: number = 0;

  @Output()
  updateUrl: EventEmitter<{ index: number; title: string; url: string }> = new EventEmitter();
  constructor() {
    
  }
  ngOnInit() {
 
      if(this.url.title){
        this.titleText = this.url.title;
      } 
       if(this.url.url){ 
        this.urlLink = this.url.url;
      }
  }
  /**
   * Accepts a title object that only emits to the parent component 
   * if the title input field is not empty 
   * @param title
   */
  updateTitle(title: object) {
    if (this.titleText !== '' && this.urlLink !== '') {
      this.updateUrl.emit({ index: this.index, title: this.titleText, url: this.urlLink });
    } 
  }

  /**
   * Accepts the url object that only emits to the parent component 
   * if the url field isn't empty and is a valid URL
   * @param url 
   */
  updateLink(url: object) {
    if (this.urlLink !== '' && this.titleText !== '') {
      this.updateUrl.emit({ index: this.index, title: this.titleText, url: this.urlLink });
    }
  }
}
