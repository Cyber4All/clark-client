import { Component, OnInit, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'clark-info-page-metadata',
    templateUrl: './metadata.component.html',
    styleUrls: ['./metadata.component.scss'],
    standalone: true,
    imports: [NgIf, NgClass]
})
export class MetadataComponent implements OnInit {

  @Input() error: string;
  @Input() warning: boolean;

  constructor() { }

  ngOnInit() {
  }

}
