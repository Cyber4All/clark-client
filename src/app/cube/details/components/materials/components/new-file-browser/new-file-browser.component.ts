import { Component, OnInit, Input } from '@angular/core';
import { LearningObject } from '@entity';

@Component({
  selector: 'clark-new-file-browser',
  templateUrl: './new-file-browser.component.html',
  styleUrls: ['./new-file-browser.component.scss']
})
export class NewFileBrowserComponent implements OnInit {
  @Input() files: LearningObject.Material.File[];

  private headers = ['Name', 'Description', 'Date', 'Size'];

  constructor() { }

  ngOnInit() {
  }

}
