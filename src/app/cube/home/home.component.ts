import { LearningObjectService } from '../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Query } from '../../shared/interfaces/query';
import { COPY } from './home.copy';
import { AuthService } from '../../core/auth.service';
import { CollectionService, Collection } from '../../core/collection.service';
import { UsageStats } from './usage-stats/types';

@Component({
  selector: 'cube-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  copy = COPY;
  query: Query = {
    limit: 1,
    released: this.auth.hasPrivelagedAccess() ? undefined : true
  };
  placeholderText = this.copy.SEARCH_PLACEHOLDER;
  collections: Collection[];

  usageStats: UsageStats = {
    objects: {
      released: 0,
      underReview: 0,
      downloads: 1032,
      lengths: {
        nanomodule: 500,
        micromodule: 128,
        module: 89,
        unit: 20,
        course: 12
      },
      outcomes: {
        remember_and_understand: 230,
        apply_and_analyze: 421,
        evaluate_and_synthesize: 78
      }
    },
    users: {
      organizations: 232
    }
  };

  constructor(
    public learningObjectService: LearningObjectService,
    private router: Router,
    private auth: AuthService,
    private collectionService: CollectionService
  ) {}

  ngOnInit() {
    this.learningObjectService
      .getLearningObjects({ limit: 1, released: true })
      .then(res => {
        this.usageStats.objects.released = res.total;
      });
    this.learningObjectService.getLearningObjects({ limit: 1 }).then(res => {
      this.usageStats.objects.underReview =
        res.total - this.usageStats.objects.released;
    });
    this.collectionService
      .getCollections()
      .then(collections => {
        this.collections = collections.filter(
          c => c.abvName === 'nccp' || c.abvName === 'c5'
        );
      })
      .catch(e => {
        console.error(e.message);
      });
  }
  keyDownSearch(event) {
    if (event.keyCode === 13) {
      this.search();
    }
  }
  search() {
    this.query.text = this.query.text.trim();
    if (this.query.text === '') {
      this.learningObjectService.clearSearch();
    } else if (this.query !== undefined) {
      this.router.navigate(['/browse'], {
        queryParams: { text: this.query.text }
      });
    }
  }
  goToContribute() {
    this.router.navigate(['/onion']);
  }
}
