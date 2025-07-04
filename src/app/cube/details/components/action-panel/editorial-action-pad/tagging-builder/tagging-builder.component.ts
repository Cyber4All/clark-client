import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LearningObject, LearningOutcome } from '@entity';
import { TaggingService } from '../services/tagging.service';
import { TopicsService } from 'app/core/learning-object-module/topics/topics.service';
import { TagsService } from 'app/core/learning-object-module/tags/tags.service';
import { AlignmentService } from '../services/alignment.service';
import { BundlingService } from '../../../../../../core/learning-object-module/bundling/bundling.service';

@Component({
  selector: 'clark-tagging-builder',
  templateUrl: './tagging-builder.component.html',
  styleUrls: ['./tagging-builder.component.scss']
})
export class TaggingBuilderComponent implements OnInit, AfterViewInit {

  @Input() learningObject: LearningObject;
  oldOutcomes: LearningOutcome[];
  @Output() close: EventEmitter<void> = new EventEmitter();

  currentTab: 'topics' | 'tags' | 'alignment' = 'topics';
  underlineLeft = '0px';
  underlineWidth = '300px';

  loading = false;

  constructor(
    private elRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private taggingService: TaggingService,
    private topicService: TopicsService,
    private tagsService: TagsService,
    private alignmentService: AlignmentService,
    private bundlingService: BundlingService
  ) { }

  async ngOnInit() {
    this.loading = true;
    const topics = await this.topicService.getTopics();
    this.taggingService.setSourceArray('topics', topics);
    // Set the outcomes for the guidelines
    this.alignmentService.setOutcomes(this.learningObject.outcomes);
    // Type these
    this.oldOutcomes = this.learningObject.outcomes.map(outcome => {
      return new LearningOutcome(outcome);
    });

    // Set selectedTopics if there is already some topics set
    if (this.learningObject.topics && this.learningObject.topics.length) {
      const matchingTopics = topics.filter((topic) => {
        return this.learningObject.topics.includes(topic._id);
      });

      this.taggingService.setSelectedArray('topics', matchingTopics);
    }

    const tags = await this.tagsService.getTags();
    this.taggingService.setSourceArray('tags', tags);

    if(this.learningObject.tags && this.learningObject.tags.length) {
      const matchingTags = tags.filter((tag) => {
        return this.learningObject.tags.includes(tag._id);
      });
      this.taggingService.setSelectedArray('tags', matchingTags);
    }
    this.loading = false;
    this.switchTab('topics');
  }

  ngAfterViewInit() {
    // Delay the underline calculation until the DOM is fully rendered
    this.cdr.detectChanges();
    this.updateUnderline();
  }


  /**
   * Switches the tab and only has two valid options 'topics' or 'tags'
   * Note: This can be expanded if we need in the future
   * @param tab
   */
  switchTab(tab: 'topics' | 'tags' | 'alignment') {
    this.currentTab = tab;
    this.updateUnderline();
  }

  /**
   * This updates the underline for the focused tab so there
   * is a visual indicator as to which page the user is on
   */
  updateUnderline() {
    // Select all tabs
    const tabs = this.elRef.nativeElement.querySelectorAll('.tab');

    const tabsArray: HTMLElement[] = Array.from(tabs) as HTMLElement[];

    const activeTab = tabsArray.find(
      (tab) => tab.textContent?.trim().toLowerCase() === this.currentTab.toLowerCase()
    );

    if (activeTab?.parentElement) {
      const tabRect = activeTab.getBoundingClientRect();
      const parentRect = activeTab.parentElement.getBoundingClientRect();

        // Calculate the underline position and width based on the active tab
        this.underlineLeft = `${tabRect.left - parentRect.left}px`;
        this.underlineWidth = `${tabRect.width}px`;

      this.cdr.detectChanges();
    }
  }

  async save() {
    // Clean the selected arrays into string arrays for the PUT request
    const tagIds = this.taggingService.finalTags.map(tag => {
      return tag._id;
    });
    const topicIds = this.taggingService.finalTopics.map(topic => {
      return topic._id;
    });

    // Only send a request if there are selected options to avoid a 400 from the service
    if(topicIds.length > 0) {
      await this.topicService.updateObjectTopics(this.learningObject.id, topicIds);
    }

    if(tagIds.length > 0) {
      await this.tagsService.updateObjectTags(this.learningObject.cuid, tagIds);
    }

    // Save the outcomes which updates the README and then rebundle that dude
    await this.alignmentService.saveOutcomeMappings(this.oldOutcomes, this.learningObject.id);
    await this.bundlingService.bundleLearningObject(this.learningObject.id);

    this.close.emit();
  }

  cancel() {
    this.close.emit();
  }

}
