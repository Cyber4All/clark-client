import { Component, OnDestroy, OnInit } from '@angular/core';
import { TagsService } from 'app/core/learning-object-module/tags/tags.service';
import { TaggingService } from '../../services/tagging.service';
import { Tag } from '@entity';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'clark-tagging',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit, OnDestroy {
  tags: Tag[];
  selectedTags: Tag[];
  query: string;
  types: string;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private tagsService: TagsService,
    private taggingService: TaggingService
  ) {
  }

  async ngOnInit(): Promise<void> {
    // Subscribe to the source arrays
    this.taggingService.tags$.pipe(takeUntil(this.destroy$)).subscribe((items: any) => {
      this.tags = items;
    });

    this.taggingService.selectedTags$.pipe(takeUntil(this.destroy$)).subscribe((selected: any) => {
      this.selectedTags = selected;
    });
  }

  // Toggle item selection for Array One
  toggleTags(item: any): void {
    this.taggingService.toggleItemInArray('tags', item);
  }

  async search(): Promise<void> {
    const tags = await this.tagsService.getTags({ text: this.query});
    this.taggingService.setSourceArray('tags', tags);
  }

  async filter(): Promise<void> {
    const tags = await this.tagsService.getTags({ text: this.query, type: this.types });
    this.taggingService.setSourceArray('tags', tags);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
