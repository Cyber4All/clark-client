import { Component, OnInit, Input } from '@angular/core';
import {md5} from './md5';

@Component({
  selector: 'clark-gravatar-image',
  template: `
        <div id="container">
            <img [src]="getGravatarImage()">
        </div>
    `,
    styles: []
})
export class GravatarImageComponent implements OnInit {
  @Input() size:number = 200;
  @Input() email:string;

  constructor() { }

  ngOnInit() {
  }

  getGravatarImage():string {
    return 'http://www.gravatar.com/avatar/' + md5(this.email) + '?s=' + this.size;
  }
}
