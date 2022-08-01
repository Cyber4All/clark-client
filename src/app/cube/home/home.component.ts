/* eslint-disable @typescript-eslint/naming-convention */
import { LearningObjectService } from '../learning-object.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Query } from '../../interfaces/query';
import { COPY } from './home.copy';
import { CollectionService, Collection } from '../../core/collection.service';
import { UsageStats } from '../shared/types/usage-stats';
import { UsageStatsService } from '../core/usage-stats/usage-stats.service';
import { BlogsComponentService } from 'app/core/blogs-component.service';
import { Blog } from 'app/components/blogs/types/blog';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'cube-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('blog', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('300ms 1200ms ease-out', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [
        style({ zIndex: 3 }),
        animate('300ms ease-out', style({ transform: 'translate3d(0, -100%, 1px)', zIndex: 3 }))
      ])
    ])
  ]
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
      topDownloads: [],
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
    private statsService: UsageStatsService,
    private blogsComponentService: BlogsComponentService
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
          c => c.abvName === 'nccp' || c.abvName === 'ncyte' || c.abvName === 'intro_to_cyber'
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

  /**
   * Catches the output emitted by clark-blogs to dismiss the banner
   *
   * @param val The value of showBanner
   */
      showBlogsBanner(val: boolean) {
      this.blogsComponentService.setShowBanner(val);
    }

  /**
   * Catches the checkbox output emitted by clark-blogs to never see the banner again
   *
   * @param args: val - the value of the checkbox
   *              recentBlog - the blog that was dismissed
   */
  neverShowBanner(args: {val: boolean, recentBlog?: Blog}) {
    this.blogsComponentService.setNeverShowBanner(args);
  }

  /**
   * Determines if the blogs banner is to be shown
   *
   * @returns a value determining if the blogs banner is shown
   */
  displayBlogsBanner() {
    return this.blogsComponentService.getShowBanner() && !this.blogsComponentService.getNeverShowBanner();
  }
}
