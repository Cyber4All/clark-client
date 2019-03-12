import { Component, OnInit, Input } from '@angular/core';
import { Collection } from 'app/core/collection.service';
import { COPY } from '../../home.copy';

@Component({
  selector: 'clark-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  @Input() collections: Collection[];

  copy = COPY;

  constructor() { }

  ngOnInit() {
  }

}
