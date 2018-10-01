import { LearningObject } from '@cyber4all/clark-entity';
import { Component, OnInit } from '@angular/core';
import { LearningObjectService } from '../../learning-object.service';
import { Query, OrderBy, SortType } from '../../../shared/interfaces/query';
import { COPY } from './org-collections.copy';
import { BrowseComponent } from '../../browse/browse.component';

@Component({
  selector: 'cube-org-collections',
  templateUrl: './org-collections.component.html',
  styleUrls: ['./org-collections.component.scss']
})
export class OrgCollectionsComponent implements OnInit {
  copy = COPY;
  

  ngOnInit() {
    
  }

}
