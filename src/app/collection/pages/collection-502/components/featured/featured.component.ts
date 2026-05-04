import { Component, OnInit } from '@angular/core';
import { TitleComponent } from '../title/title.component';

@Component({
    selector: 'clark-502-featured',
    templateUrl: './featured.component.html',
    styleUrls: ['./featured.component.scss'],
    standalone: true,
    imports: [TitleComponent]
})
export class FeaturedComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
