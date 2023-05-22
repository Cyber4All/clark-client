import { Component, OnInit } from '@angular/core';
import { LearningObject } from '../../../../entity/learning-object/learning-object';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarService } from '../../../core/navbar.service';
import { LearningObjectService } from '../../../cube/learning-object.service';
import { Query } from '../../../interfaces/query';
import { Subject } from 'rxjs';
import { CollectionService } from '../../../core/collection.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'clark-security-injections',
  templateUrl: './security-injections.component.html',
  styleUrls: ['./security-injections.component.scss']
})
export class SecurityInjectionsComponent implements OnInit {
  
  key = new Subject<string>();
  pictureLocation: string;
  collection;
  showContribute = false;

  learningObjects: LearningObject[];
  guidelineNames: [];
  loading = true;
  query = {
    limit: 5,
    collection: 'security-injections'
  };

  COPY = {
    VIEWALL: 'View All'
  };

  //console.log
  constructor(
    private navbarService: NavbarService,
    private learningObjectService: LearningObjectService,
    private collectionService: CollectionService
  ) { }

  async ngOnInit() {
    this.navbarService.show();
    await this.fetchLearningObjects(this.query);
  }

  async fetchLearningObjects(query: Query) {
    this.loading = true;
    this.learningObjects = [];
    // Trim leading and trailing whitespace
    query.text = query.text ? query.text.trim() : undefined;
    try {
      const {
        learningObjects,
        total
      } = await this.learningObjectService.getLearningObjects(query);
      this.learningObjects = learningObjects;
      this.loading = false;
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }
//console.log

}
