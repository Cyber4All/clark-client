import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'clark-details-splash-length',
  templateUrl: './length.component.html',
  styleUrls: ['./length.component.scss']
})
export class LengthComponent implements OnInit {
  @Input() length: 'nanomodule' | 'micromodule' | 'module' | 'unit' | 'course';

  constructor() { }

  ngOnInit() {
  }

}
