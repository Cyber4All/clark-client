import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-info-page-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit {

  @Input() error: string;
  @Input() warning: boolean;

  constructor() { }

  ngOnInit() {
  }

}
