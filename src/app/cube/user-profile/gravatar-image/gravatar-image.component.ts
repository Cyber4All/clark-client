import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-gravatar-image',
  template: `
        <div id="container">
            <img [src]="getGravatarImage()">
            <input [(ngModel)]="email" type="email" placeholder="Enter your Gravatar email">
        </div>
    `,
    styles: []
})
export class GravatarImageComponent implements OnInit {
  @Input() size:number = 200;
  @Input() email:string = "";

  constructor() { }

  ngOnInit() {
  }

  getGravatarImage():string {
    return 'http://www.gravatar.com/avatar/' + this.email + '?s=' + this.size;
  }

}
