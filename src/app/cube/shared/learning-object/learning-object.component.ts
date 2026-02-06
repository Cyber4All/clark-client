import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnDestroy
} from '@angular/core';
import { LearningObject } from '@entity';
import { titleCase } from 'title-case';
import { AuthService } from '../../../core/auth-module/auth.service';
import { TagsService } from '../../../core/learning-object-module/tags/tags.service';
import { TopicsService } from '../../../core/learning-object-module/topics/topics.service';
import { MetricService } from '../../../core/metric-module/metric.service';
import { RatingService } from '../../../core/rating-module/rating.service';

@Component({
  selector: 'clark-learning-object-component',
  templateUrl: 'learning-object.component.html',
  styleUrls: ['./learning-object.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearningObjectListingComponent implements OnDestroy {
  // -----------------------------
  // Host bindings
  // -----------------------------
  @HostBinding('class.loading') private isLoadingClass = false;

  // -----------------------------
  // Inputs (setters trigger refresh)
  // -----------------------------
  private _learningObject: LearningObject | null = null;

  @Input()
  set learningObject(value: LearningObject) {
    this._learningObject = value;
    void this.refresh();
  }
  get learningObject(): LearningObject {
    return this._learningObject!;
  }

  @Input()
  set loading(value: boolean) {
    this.isLoadingClass = !!value;
    this.cd.markForCheck();
  }

  // -----------------------------
  // Card image
  // -----------------------------
  imagePath: string = 'generic';

  // -----------------------------
  // Rating properties
  // -----------------------------
  averageRating = 0;
  reviewsCount = 0;

  // -----------------------------
  // Metric properties
  // -----------------------------
  downloadsCount = 0;
  isTrending = false;
  isDCWFAligned = false;

  // -----------------------------
  // Metadata properties
  // -----------------------------
  tags: string[] = [];
  topics: string[] = [];

  static readonly TRENDING_THRESHOLD = 10; // downloads in last 30 days

  // -----------------------------
  // Shared caches to avoid redundant fetches
  // -----------------------------
  private static topicsMap = new Map<string, string>();
  private static tagsMap = new Map<string, string>();

  // Shared "in-flight" promises (prevents multiple simultaneous fetches across cards)
  private static topicsReady?: Promise<void>;
  private static tagsReady?: Promise<void>;

  // -----------------------------
  // Async safety
  // -----------------------------
  private refreshToken = 0;
  private destroyed = false;

  constructor(
    private ratingService: RatingService,
    private metricService: MetricService,
    public auth: AuthService,
    private cd: ChangeDetectorRef,
    private tagsService: TagsService,
    private topicsService: TopicsService
  ) { }

  ngOnDestroy() {
    this.destroyed = true;
    this.refreshToken++; // invalidate any in-flight refresh
    this.cd.detach();
  }

  // -----------------------------
  // Refresh pipeline (single source of truth)
  // -----------------------------
  private resetViewModel() {
    this.imagePath = 'generic';
    this.averageRating = 0;
    this.reviewsCount = 0;
    this.downloadsCount = 0;
    this.isTrending = false;
    this.isDCWFAligned = false;
    this.tags = [];
    this.topics = [];
  }

  private async refresh(): Promise<void> {
    const lo = this._learningObject;
    if (!lo || this.destroyed) return;

    const token = ++this.refreshToken;

    // Prevent sticky UI by clearing immediately
    this.resetViewModel();
    this.cd.markForCheck();

    // Resolve sync derived info early
    this.isDCWFAligned = this.checkDCWFAlignment(lo);

    // Resolve tags/topics (cached, minimal fetch)
    await Promise.all([this.resolveTopicNames(lo), this.resolveTagNames(lo)]);
    if (this.destroyed || token !== this.refreshToken) return;

    // Image depends on topics
    this.setImageFromTopics();

    // Fetch ratings + total downloads + recent downloads (in parallel)
    const [ratings, totalMetrics, recentDownloads] = await Promise.all([
      this.ratingService.getLearningObjectRatings(lo.cuid, lo.version),
      this.metricService.getLearningObjectMetrics(lo.cuid),
      this.getRecentDownloads(lo.cuid, 30)
    ]);
    if (this.destroyed || token !== this.refreshToken) return;

    this.averageRating = ratings?.avgValue ?? 0;
    this.reviewsCount = ratings?.ratings?.length ?? 0;
    this.downloadsCount = totalMetrics?.downloads ?? 0;

    this.isTrending =
      (recentDownloads ?? 0) >= LearningObjectListingComponent.TRENDING_THRESHOLD;

    this.cd.detectChanges();
  }

  // -----------------------------
  // Helpers used by template
  // -----------------------------
  truncateText(text: string, max: number = 150, margin: number = 10): string {
    if (!text) return '';

    const cleaned = this.stripHtml(text).trim();
    if (cleaned.length <= max) return cleaned;

    const truncated = cleaned.substring(0, max);
    const spaceAfter = cleaned.substring(max).indexOf(' ') + truncated.length;
    const spaceBefore = truncated.lastIndexOf(' ');

    // If mid-word but close to finishing the word, include it
    if (spaceAfter - truncated.length <= margin) {
      return cleaned.substring(0, spaceAfter + 1).trim() + '...';
    }

    // Otherwise truncate at last whole word
    return cleaned.substring(0, spaceBefore + 1).trim() + '...';
  }

  stripHtml(str: string): string {
    if (!str) return '';
    // Matches tags such as <br /> and </p>
    str = str.replace(/<[0-z\s'"=]*[\/]+>/gi, ' ');
    return str.replace(/<[\/]*[0-z\s'"=]+>/gi, ' ');
  }

  get humanReadableLength() {
    const learningObjectLength = this._learningObject?.length;
    switch (learningObjectLength) {
      case 'nanomodule':
        return 'UP TO ONE HOUR';
      case 'micromodule':
        return '1 - 4 HOURS';
      case 'module':
        return '4 - 10 HOURS';
      case 'unit':
        return 'OVER 10 HOURS';
      case 'course':
        return '15 WEEKS';
      default:
        return '';
    }
  }

  organizationFormat(organization: string) {
    return organization ? titleCase(organization) : '';
  }

  // -----------------------------
  // Derived state
  // -----------------------------
  private setImageFromTopics() {
    // If no topics, use generic
    let firstTopic = this.topics?.[0] ?? 'generic';

    // If the topic is AI/Machine Learning, use AI_Machine Learning.png as the image
    if (firstTopic === 'AI/Machine Learning') {
      firstTopic = 'AI Machine Learning';
    }

    this.imagePath = `/assets/images/topics/${firstTopic}.png`;
  }

  private checkDCWFAlignment(lo: LearningObject): boolean {
    if (!lo?.guidelines?.length) return false;

    return lo.guidelines.some(guideline =>
      guideline.source?.toLowerCase().includes('dod cyber workforce') ||
      guideline.frameworkName?.toLowerCase().includes('dod cyber workforce')
    );
  }

  private async getRecentDownloads(cuid: string, days: number): Promise<number> {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - days);

    const recentMetrics = await this.metricService.getLearningObjectMetrics(
      cuid,
      start.toISOString(),
      end.toISOString()
    );

    return recentMetrics?.downloads ?? 0;
  }

  // -----------------------------
  // Topic/Tag resolution (cached)
  // -----------------------------
  private async ensureTopicsCache(): Promise<void> {
    if (LearningObjectListingComponent.topicsMap.size > 0) return;

    if (!LearningObjectListingComponent.topicsReady) {
      LearningObjectListingComponent.topicsReady = (async () => {
        const topics = await this.topicsService.getTopics();
        LearningObjectListingComponent.topicsMap = new Map<string, string>(
          topics.map(t => [t._id, t.name])
        );
      })();
    }

    await LearningObjectListingComponent.topicsReady;
  }

  private async ensureTagsCache(): Promise<void> {
    if (LearningObjectListingComponent.tagsMap.size > 0) return;

    if (!LearningObjectListingComponent.tagsReady) {
      LearningObjectListingComponent.tagsReady = (async () => {
        const tags = await this.tagsService.getTags();
        LearningObjectListingComponent.tagsMap = new Map<string, string>(
          tags.map(t => [t._id, t.name])
        );
      })();
    }

    await LearningObjectListingComponent.tagsReady;
  }

  private async resolveTopicNames(lo: LearningObject): Promise<void> {
    if (!lo?.topics?.length) {
      this.topics = [];
      return;
    }

    await this.ensureTopicsCache();

    this.topics = lo.topics
      .map((id: string) => LearningObjectListingComponent.topicsMap.get(id))
      .filter((t): t is string => !!t);
  }

  private async resolveTagNames(lo: LearningObject): Promise<void> {
    if (!lo?.tags?.length) {
      this.tags = [];
      return;
    }

    await this.ensureTagsCache();

    this.tags = lo.tags
      .map((id: string) => LearningObjectListingComponent.tagsMap.get(id))
      .filter((t): t is string => !!t);
  }
}
