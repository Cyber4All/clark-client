import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'onion-file-details',
  templateUrl: 'file-details.component.html',
  styleUrls: [ 'file-details.component.scss' ]
})
export class FileDetailsComponent implements OnInit {
  @Input() materials;

  constructor() { }

  ngOnInit() { }
}
