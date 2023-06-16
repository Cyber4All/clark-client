import { Component, EventEmitter, OnInit } from '@angular/core';
import { LearningObject } from '../../../../entity/learning-object/learning-object';
import { NavbarService } from '../../../core/navbar.service';
import { LearningObjectService } from '../../../cube/learning-object.service';
import { Query } from '../../../interfaces/query';
import { CollectionService } from '../../../core/collection.service';


@Component({
  selector: 'clark-502-collection-index',
  templateUrl: './collection-502.component.html',
  styleUrls: ['./collection-502.component.scss']
})
export class Collection502Component implements OnInit {

  learningObjects: LearningObject[];
  guidelineNames: [];
  loading = true;
  isChecked = true;
  checked = true;
  query = {
    limit: 5,
    collection: '502_project'
  };
  currentTheme = 'dark';

  constructor(
    private navbarService: NavbarService,
    private learningObjectService: LearningObjectService,
    private collectionService: CollectionService
  ) { }

  async ngOnInit() {
    this.navbarService.show();
    await this.fetchLearningObjects(this.query);

    this.collectionService.darkMode502.subscribe(mode => {
      this.currentTheme = mode ? 'dark' : 'light';
    });
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

  /**
   * Method to toggle the dark mode for the 502 collection
   *
   * @param change Object emitted by the mat-slide-toggle component
   */
  toggle(change: {source: any, checked: boolean}) {
    if (change.checked) {
      this.currentTheme = 'dark';
    } else {
      this.currentTheme = 'light';
    }
    this.collectionService.changeStatus502(change.checked);
  }
}
