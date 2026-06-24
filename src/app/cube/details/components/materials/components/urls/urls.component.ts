import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'clark-urls',
    templateUrl: './urls.component.html',
    styleUrls: ['./urls.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor]
})
export class UrlsComponent implements OnInit {

  @Input() urls: LearningObject.Material.Url[];

  constructor() { }

  ngOnInit() {
  }

}
