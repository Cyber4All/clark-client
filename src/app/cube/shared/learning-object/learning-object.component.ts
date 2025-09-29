import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges
} from '@angular/core';
import { LearningObject } from '@entity';
import { MetricService } from 'app/core/metric-module/metric.service';
import { RatingService } from 'app/core/rating-module/rating.service';
import { titleCase } from 'title-case';
import { AuthService } from '../../../core/auth-module/auth.service';
import { CollectionService } from '../../../core/collection-module/collections.service';
import { LibraryService } from '../../../core/library-module/library.service';

@Component({
  selector: 'clark-learning-object-component',
  templateUrl: 'learning-object.component.html',
  styleUrls: ['./learning-object.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearningObjectListingComponent implements OnInit, OnChanges, OnDestroy {
  @Input() learningObject: LearningObject;
  @Input() loading: boolean;

  collections = new Map<string, string>();
  collection = '';
  pictureLocation: string;
  link: string;

  canDownload = false;
  showDownloadModal = false;

  // FIXME this removes the download icons while issues with the Library service are resolved
  downloadService = false;

  averageRating: number;
  reviewsCount: number;
  starColor = 'gold';
  downloadsCount = 0;
  recentDownloads = 0;
  isTrending = false;
  TRENDING_THRESHOLD = 10; // downloads in last 30 days to be considered trending

  constructor(
    private hostEl: ElementRef,
    private renderer: Renderer2,
    private library: LibraryService,
    private ratingService: RatingService,
    private metricService: MetricService,
    public auth: AuthService,
    private collectionService: CollectionService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loading) {
      if (changes.loading.currentValue) {
        this.renderer.addClass(this.hostEl.nativeElement, 'loading');
      } else {
        this.renderer.removeClass(this.hostEl.nativeElement, 'loading');
      }
    }
  }

  async ngOnInit() {
    this.collectionService.getCollections().then(collections => {
      this.collections = new Map(
        collections.map(c => [c.abvName, c.name] as [string, string])
      );
      this.onResize();
    });

    const ratings = await this.ratingService.getLearningObjectRatings(this.learningObject.cuid, this.learningObject.version);
    this.averageRating = ratings.avgValue;
    this.reviewsCount = ratings.ratings?.length;

    try {
      const metrics = await this.metricService.getLearningObjectMetrics(this.learningObject.cuid);
      this.downloadsCount = metrics?.downloads ?? 0;
    } catch (e) {
      this.downloadsCount = 0;
    }

    // Attempt to fetch downloads for the last 30 days to determine trending
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      const recentMetrics = await this.metricService.getLearningObjectMetrics(
        this.learningObject.cuid,
        start.toISOString(),
        end.toISOString()
      );
      // The API should ideally return downloads for the period; fallback to 0 if not available
      this.recentDownloads = recentMetrics?.downloads ?? 0;
      // Only mark trending if object was updated/published within the last 30 days
      const updatedDate = new Date(this.learningObject.date);
      const wasUpdatedRecently = updatedDate >= start;
      this.isTrending = wasUpdatedRecently && this.recentDownloads >= this.TRENDING_THRESHOLD;
    } catch (e) {
      this.recentDownloads = 0;
      this.isTrending = false;
    }

    this.cd.detectChanges();
  }

  goals() {
    const punc = ['.', '!', '?'];
    const descriptionString = this.learningObject.description;
    const final = this.truncateText(
      descriptionString.charAt(0).toUpperCase() +
      descriptionString.substring(1),
      150
    );

    if (punc.includes(final.charAt(final.length - 1))) {
      return final;
    } else {
      return final + '.';
    }
  }

  // truncates and appends an ellipsis to block of text based on maximum number of characters
  truncateText(text: string, max: number = 150, margin: number = 10): string {
    // remove any HTML characters from text
    text = this.stripHtml(text);

    // check to see if we need to truncate, IE is the text shorter than max + margin
    if (text.length <= max + margin) {
      return text.trim();
    }

    // ok now we know we need to truncate text
    let outcome = text.substring(0, max);
    const spaceAfter = text.substring(max).indexOf(' ') + outcome.length; // first space before the truncation index
    const spaceBefore = outcome.lastIndexOf(' '); // first space after the truncation index
    const punc = ['.', '!', '?'];

    // if we've truncated such that the last char is a space or a natural punctuation, just return
    if (punc.includes(outcome.charAt(outcome.length - 1))) {
      outcome = outcome.trim();
    } else if (outcome.charAt(outcome.length - 1) === ' ') {
      outcome = outcome.substring(0, outcome.length - 1).trim() + '...';
    }

    // otherwise we're in the middle of a word and should attempt to finsih the word before adding an ellpises
    if (spaceAfter - outcome.length <= margin) {
      outcome = text.substring(0, spaceAfter + 1).trim();
    } else {
      outcome = text.substring(0, spaceBefore + 1).trim();
    }

    return outcome.trim() + '...';
  }

  stripHtml(str: string): string {
    // The top regex is used for matching tags such as <br />
    // The bottom regex will catch tags such as </p>
    str = str.replace(/<[0-z\s\'\"=]*[\/]+>/gi, ' ');
    return str.replace(/<[\/]*[0-z\s\'\"=]+>/gi, ' ');
  }

  get date() {
    // eslint-disable-next-line radix
    return new Date(this.learningObject.date);
  }

  /**
   * Function to conditionally set the title case of an organization
   *
   * @param organization string of the users affiliated organization
   * @returns string unformated or title cased
   */
  organizationFormat(organization: string) {
    return titleCase(organization);
  }

  onResize() {
    this.collection = this.collections.get(this.learningObject.collection);
    if (
      this.learningObject.collection !== 'intro_to_cyber' &&
      this.learningObject.collection !== 'secure_coding_community' &&
      this.learningObject.collection !== 'plan c' &&
      this.learningObject.collection !== 'max_power' &&
      this.learningObject.collection !== 'Drafts' &&
      this.learningObject.collection !== 'nccp' &&
      this.learningObject.collection !== ''
    ) {
      this.pictureLocation =
        '/assets/images/collections/' +
        this.learningObject.collection +
        '.png';
    } else {
      this.pictureLocation = 'generic';
    }
    this.cd.detectChanges();
    if (window.screen.width <= 750 && this.collection.length > 12) {
      this.collection = this.collection.substring(0, 12) + '...';
    }
  }

  ngOnDestroy() {
    this.cd.detach();
  }
}
