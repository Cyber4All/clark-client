import { Component, OnInit, OnDestroy } from '@angular/core';
import { LearningObject } from '../../../../entity/learning-object/learning-object';
import { NavbarService } from '../../../core/client-module/navbar.service';
import { Query } from '../../../interfaces/query';
import { CollectionService } from '../../../core/collection-module/collections.service';
import { Title } from '@angular/platform-browser';
import { SearchService } from 'app/core/learning-object-module/search/search.service';
import { Subscription } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatIcon } from '@angular/material/icon';
import { Header502Component } from './components/header/header.component';
import { CollectionFeatureComponent } from '../../shared/included/collection-feature/collection-feature.component';
import { Stats502Component } from './components/stats/stats.component';
import { About502Component } from './components/about/about.component';
import { Curators502Component } from './components/curators/curators.component';

@Component({
    selector: 'clark-502-collection-index',
    templateUrl: './collection-502.component.html',
    styleUrls: ['./collection-502.component.scss'],
    standalone: true,
    imports: [MatSlideToggle, MatIcon, Header502Component, CollectionFeatureComponent, Stats502Component, About502Component, Curators502Component]
})
export class Collection502Component implements OnInit, OnDestroy {

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
