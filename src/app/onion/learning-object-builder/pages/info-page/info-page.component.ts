import { Component, OnInit } from '@angular/core';
import { takeUntil, map, filter } from 'rxjs/operators';
import { BuilderStore } from '../../builder-store.service';
import { LearningObject } from '@cyber4all/clark-entity';
import { COPY } from './info-page.copy';

@Component({
  selector: 'clark-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.scss']
})
export class InfoPageComponent implements OnInit {

  constructor(private store: BuilderStore) { }
  copy = COPY;
  ngOnInit() {
    // listen for outcome events and update component stores
    this.store.event.pipe(
      filter(x => x.type === 'object'),
      map(x => x.payload),
    ).subscribe((payload: LearningObject) => {
      console.log('payload', payload);
    });

    if (this.store.learningObject) {
      // assignment here
    }
  }

}
