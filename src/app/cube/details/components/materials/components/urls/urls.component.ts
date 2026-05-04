import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';


@Component({
    selector: 'clark-urls',
    templateUrl: './urls.component.html',
    styleUrls: ['./urls.component.scss'],
    standalone: true,
    imports: []
})
export class UrlsComponent implements OnInit {

  @Input() urls: LearningObject.Material.Url[];

  constructor() { }

  ngOnInit() {
  }

}
