import { LearningObjectService } from '../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Query } from '../../interfaces/query';
import { COPY } from './home.copy';
import { CollectionService, Collection } from '../../core/collection.service';
import { UsageStats } from '../shared/types/usage-stats';
import { UsageStatsService } from '../core/usage-stats/usage-stats.service';

@Component({
  selector: 'cube-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  copy = COPY;
  query: Query = {
    limit: 1
  };

  placeholderText = this.copy.SEARCH_PLACEHOLDER;
  collections: Collection[];

  objectStatsLoaded = false;
  userStatsLoaded = false;

  usageStats: UsageStats = {
    objects: {
      released: 0,
      review: 0,
      downloads: 0,
      collections: { number: 0 },
      lengths: {
        nanomodule: 0,
        micromodule: 0,
        module: 0,
        unit: 0,
        course: 0
      },
      outcomes: {
        remember_and_understand: 0,
        apply_and_analyze: 0,
        evaluate_and_synthesize: 0
      }
    },
    users: {
      accounts: 0,
      organizations: 0
    }
  };
  donateModal = false;

  constructor(
    public learningObjectService: LearningObjectService,
    private router: Router,
    private collectionService: CollectionService,
    private statsService: UsageStatsService
  ) {}

  ngOnInit() {
    this.statsService.getLearningObjectStats().then(stats => {
      this.usageStats.objects.released = stats.released;
      this.usageStats.objects.review = stats.review;
      this.usageStats.objects.downloads = stats.downloads;
      this.usageStats.objects.collections = stats.collections;
      this.objectStatsLoaded = true;
    });

    this.statsService.getUserStats().then(stats => {
      this.usageStats.users.accounts = stats.accounts;
      this.usageStats.users.organizations = stats.organizations;
      this.userStatsLoaded = true;
    });

    this.collectionService
      .getCollections()
      .then(collections => {
        this.collections = collections.filter(
          c => c.abvName === 'nccp' || c.abvName === 'c5' || c.abvName === 'plan c'
        );
      })
      .catch(e => {
        console.error(e.message);
      });
  }

  search(text: string) {
    this.query.text = text;

    if (this.query.text === '') {
      this.learningObjectService.clearSearch();
    } else if (this.query.text !== undefined) {
      this.router.navigate(['/browse'], {
        queryParams: { text: this.query.text }
      });
    }
  }

  mailTo() {
    window.location.href = 'mailto:?subject=Check out Learning Objects on CLARK!&body=https://www.clark.center';
  }

  donateToClark() {
    this.router.navigate(['donate'], {
    });
  }
}
