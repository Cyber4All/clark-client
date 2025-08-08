import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

  types: { [key: string]: boolean }[] = [];
  selectedTypes: { [key: string]: boolean } = {};

  private destroy$ = new Subject<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;


  constructor(
    private tagsService: TagsService,
    private taggingService: TaggingService,
    private cdr: ChangeDetectorRef
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

    try {
      this.types = await this.tagsService.getTypes();
    } catch (error) {
      console.warn('Error loading tag types:', error);
      this.types = [];
    }
    this.types.forEach((type: any) => {
      this.selectedTypes[type.value] = false;
    });
    this.cdr.detectChanges();
  }

  // Toggle item selection of tags
  toggleTags(item: any): void {
    this.taggingService.toggleItemInArray('tags', item);
  }

  async search(): Promise<void> {
    try {
      const tags = await this.tagsService.getTags({ text: this.query});
      this.taggingService.setSourceArray('tags', tags);
    } catch (error) {
      console.warn('Error searching tags:', error);
      this.taggingService.setSourceArray('tags', []);
    }
  }

  async filter(val: string): Promise<void> {
    this.selectedTypes[val] = !this.selectedTypes[val];
    const keys = Object.keys(this.selectedTypes).filter(key => this.selectedTypes[key] === true);
    try {
      const tags = await this.tagsService.getTags({ text: this.query, type: keys });
      this.taggingService.setSourceArray('tags', tags);
    } catch (error) {
      console.warn('Error filtering tags:', error);
      this.taggingService.setSourceArray('tags', []);
    }
    this.cdr.detectChanges();
  }

  selected(item: Tag) {
    return this.selectedTags.some(tag => tag._id === item._id);
  }

  focusInput() {
    this.searchInput.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
