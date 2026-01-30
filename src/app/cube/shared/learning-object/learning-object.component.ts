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
import { TagsService } from 'app/core/learning-object-module/tags/tags.service';
import { MetricService } from 'app/core/metric-module/metric.service';
import { RatingService } from 'app/core/rating-module/rating.service';
import { titleCase } from 'title-case';
import { AuthService } from '../../../core/auth-module/auth.service';
import { TopicsService } from '../../../core/learning-object-module/topics/topics.service';

@Component({
  selector: 'clark-learning-object-component',
  templateUrl: 'learning-object.component.html',
  styleUrls: ['./learning-object.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearningObjectListingComponent implements OnInit, OnChanges, OnDestroy {
  @Input() learningObject: LearningObject;
  @Input() loading: boolean;

  // Card image
  imagePath: string;

  // Rating properties
  averageRating: number;
  reviewsCount: number;

  // Metric properties
  downloadsCount = 0;
  isTrending = false;
  isDCWFAligned = false;

  // Metadata properties
  tags: string[] = [];
  topics: string[] = [];

  // Optimized static storage for tags and topics to avoid redundant fetches
  private static topicsMap = new Map<string, string>();
  private static tagsMap = new Map<string, string>();

  static readonly TRENDING_THRESHOLD = 10; // downloads in last 30 days to be considered trending

  constructor(
    private hostEl: ElementRef,
    private renderer: Renderer2,
    private ratingService: RatingService,
    private metricService: MetricService,
    public auth: AuthService,
    private cd: ChangeDetectorRef,
    private tagsService: TagsService,
    private topicsService: TopicsService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loading) {
      if (changes.loading.currentValue) {
        this.renderer.addClass(this.hostEl.nativeElement, 'loading');
      } else {
        this.renderer.removeClass(this.hostEl.nativeElement, 'loading');
      }
    }

    // When learningObject changes, reset and recalculate all derived properties
    if (changes.learningObject && !changes.learningObject.firstChange) {
      this.isDCWFAligned = false;
      this.tags = [];
      this.topics = [];

      this.checkDCWFAlignment();
      this.resolveTagNames();
      this.resolveTopicNames();
    }
  }

  async ngOnInit() {
    // Resolve topics and tags
    await this.resolveTopicNames();
    await this.resolveTagNames();

    // Check for DCWF framework alignment
    this.checkDCWFAlignment();

    this.setImage();

    // Fetch ratings and metrics
    const ratings = await this.ratingService.getLearningObjectRatings(this.learningObject.cuid, this.learningObject.version);
    this.averageRating = ratings.avgValue;
    this.reviewsCount = ratings.ratings?.length;

    const metrics = await this.metricService.getLearningObjectMetrics(this.learningObject.cuid);
    this.downloadsCount = metrics?.downloads ?? 0;

    // Determine trending status
    await this.resolveTrending();

    this.cd.detectChanges();
  }

  /* Truncate text without cutting off words in the middle */
  truncateText(text: string, max: number = 150, margin: number = 10): string {
    // Remove HTML and trim whitespace
    text = this.stripHtml(text).trim();

    // Truncate the text to the maximum length
    let truncatedText = text.substring(0, max);

    // Early return if text is already within limits
    if (text.length <= max) {
      return text;
    }

    // Index of first space after and before the truncation index
    const spaceAfter = text.substring(max).indexOf(' ') + truncatedText.length;
    const spaceBefore = truncatedText.lastIndexOf(' ');

    // If we are in the middle of a word, attempt to finish the word before adding an ellpises
    if (spaceAfter - truncatedText.length <= margin) {
      return text.substring(0, spaceAfter + 1).trim() + '...';
    }

    // Otherwise, truncate at the last space before the limit
    return text.substring(0, spaceBefore + 1).trim() + '...';
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

  setImage() {
    const imageTopic = this.topics?.[0];
    this.imagePath = imageTopic ? `/assets/images/topics/${imageTopic}.png` : 'generic';
    console.log('Image path set to:', this.imagePath);
    this.cd.detectChanges();
  }

  /**
   * Check if the learning object has DCWF framework mappings in its guidelines
   */
  checkDCWFAlignment() {
    if (this.learningObject?.guidelines && this.learningObject.guidelines.length > 0) {
      this.isDCWFAligned = this.learningObject.guidelines.some(guideline =>
        guideline.source?.toLowerCase().includes('dod cyber workforce') ||
        guideline.frameworkName?.toLowerCase().includes('dod cyber workforce'));
    }
  }

  async resolveTrending() {
    // Attempt to fetch downloads for the last 30 days to determine trending
    const end = new Date();
    const start = new Date(end.getDate() - 30);
    const recentMetrics = await this.metricService.getLearningObjectMetrics(
      this.learningObject.cuid,
      start.toISOString(),
      end.toISOString()
    );
    const recentDownloads = recentMetrics?.downloads ?? 0;

    // Mark as trend if the object has at least TRENDING_THRESHOLD downloads in the last 30 days
    this.isTrending = recentDownloads >= LearningObjectListingComponent.TRENDING_THRESHOLD;
  }

  async resolveTopicNames(): Promise<void> {
    // If the learning object does not have topics, clear and return early
    if (!this.learningObject?.topics || this.learningObject.topics.length === 0) {
      this.topics = [];
      return;
    }

    // Generate topics map if not already done
    if (LearningObjectListingComponent.topicsMap.size === 0) {
      const topics = await this.topicsService.getTopics()
      LearningObjectListingComponent.topicsMap = new Map<string, string>(
        topics.map(topic => [topic._id, topic.name])
      );
    }

    // Resolve topic IDs to names
    this.topics = this.learningObject.topics.map((topicId: string) => {
      return LearningObjectListingComponent.topicsMap.get(topicId);
    });
  }

  /**
   * Resolve tag IDs to tag names for display
   */
  async resolveTagNames() {
    // If there are no tags, clear and return early
    if (!this.learningObject?.tags || this.learningObject.tags.length === 0) {
      this.tags = [];
      return;
    }

    // Fetch all tags if not already loaded, using a shared promise to avoid multiple fetches
    if (LearningObjectListingComponent.tagsMap.size === 0) {
      const tags = await this.tagsService.getTags();
      LearningObjectListingComponent.tagsMap = new Map<string, string>(
        tags.map(tag => [tag._id, tag.name])
      );
    }

    // Resolve tag IDs to names
    this.tags = this.learningObject.tags.map((tagId: string) =>
      LearningObjectListingComponent.tagsMap.get(tagId)
    );
  }

  ngOnDestroy() {
    this.cd.detach();
  }
}
