import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { TaggingService } from '../../services/tagging.service';
import { Topic } from '@entity';
import { TopicsService } from 'app/core/learning-object-module/topics/topics.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-topic-tagging',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicsComponent implements OnInit, OnDestroy {
  topics: Topic[];
  selectedTopics: Topic[];

  private destroy$ = new Subject<void>();

  constructor(
    private taggingService: TaggingService
  ) { }

  async ngOnInit(): Promise<void> {
    // Subscribe to the source arrays for topics
    this.taggingService.topics$.pipe(takeUntil(this.destroy$)).subscribe((items: any) => {
      this.topics = items;
    });

    this.taggingService.selectedTopics$.pipe(takeUntil(this.destroy$)).subscribe((selected) => {
      this.selectedTopics = selected;
    });

  }

  // Toggle item selection for selectedTopics array
  toggleTopics(item: any): void {
    this.taggingService.toggleItemInArray('topics', item);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
