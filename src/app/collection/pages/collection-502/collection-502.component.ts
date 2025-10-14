import { Component, OnInit } from '@angular/core';
import { LearningObject } from '../../../../entity/learning-object/learning-object';
import { NavbarService } from '../../../core/client-module/navbar.service';
import { Query } from '../../../interfaces/query';
import { CollectionService } from '../../../core/collection-module/collections.service';
import { Title } from '@angular/platform-browser';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'clark-502-collection-index',
  templateUrl: './collection-502.component.html',
  styleUrls: ['./collection-502.component.scss']
})
export class Collection502Component implements OnInit {

  learningObjects: LearningObject[];
  guidelineNames: [];
  loading = true;
  query = {
    limit: 5,
    collection: '502_project'
  };
  currentTheme = 'dark';
  private sub = new Subscription();

  constructor(
    private navbarService: NavbarService,
    private searchLearningObjectService: SearchService,
    private collectionService: CollectionService,
    private titleService: Title,
  ) { }

  async ngOnInit() {
    this.navbarService.show();
    await this.fetchLearningObjects(this.query);
    this.titleService.setTitle('CLARK | The 502 Project');

    this.sub.add(
      this.collectionService.darkMode502.subscribe(mode => {
        this.currentTheme = mode ? 'dark' : 'light';
      })
    );

    // const toggleSwitch = document.querySelector('mat-slide-toggle input[type="checkbox"]');

    // const switchTheme = (e: Event) => {
    //   this.collectionService.changeStatus502((e.target as HTMLInputElement).checked);
    //   console.log('Toggle theme')
    // };

    // toggleSwitch!.addEventListener('change', switchTheme);

    this.collectionService.darkMode502.subscribe(mode => {
      this.currentTheme = mode ? 'dark' : 'light';
    });
    if (this.currentTheme === 'dark') {
      document!.getElementById('mat-slide-toggle-1-input')!.click();
    };
  }

  onThemeToggle(checked: boolean){
    this.collectionService.changeStatus502(checked);
  }

  async fetchLearningObjects(query: Query) {
    this.loading = true;
    this.learningObjects = [];
    try {
      const {
        learningObjects,
        total
      } = await this.searchLearningObjectService.getLearningObjects(query);
      this.learningObjects = learningObjects;
      this.loading = false;
    } catch (e) {
      console.log(`Error: ${e}`);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
