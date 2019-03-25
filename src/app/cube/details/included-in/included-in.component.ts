import { Component, OnInit, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { IncludedInService } from './included-in.service';
import { LearningObject } from '@entity';

@Component({
  selector: 'cube-details-included-in',
  styleUrls: ['included-in.component.scss'],
  templateUrl: 'included-in.component.html',
  providers: [ IncludedInService ]
})
export class DetailsIncludedInComponent implements OnInit, OnChanges {

  @Input() learningObject: LearningObject;
  parents;

  constructor(public service: IncludedInService) { }

  ngOnInit() {
    this.loadParents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadParents();
  }

  private loadParents() {
    this.service.fetchParents(this.learningObject['id']).then((data: any) => {
      this.parents = data.map(learningObject => new LearningObject(learningObject));
    }).catch(e => {
      console.error(e);
    });
  }
}
