import { Component, OnInit } from '@angular/core';
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
  color = "blue";
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

    const toggleSwitch = document.querySelector('mat-slide-toggle button[type="button"]');

    const switchTheme = (e: any) => {
      console.log(e);
      this.collectionService.changeStatus502((e.target as HTMLInputElement).checked);
    };

    toggleSwitch!.addEventListener('change', switchTheme);

    this.collectionService.darkMode502.subscribe(mode => {
      console.log(mode, toggleSwitch);
      this.currentTheme = mode ? 'dark' : 'light';
    });
    if(this.currentTheme === 'dark'){
      document!.getElementById('mat-mdc-slide-toggle-1-input')!.click();
    };
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
}
