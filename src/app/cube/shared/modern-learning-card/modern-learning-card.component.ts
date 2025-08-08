import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { LearningObject } from '@entity';
import { titleCase } from 'title-case';
import { AuthService } from '../../../core/auth-module/auth.service';
import { CollectionService } from '../../../core/collection-module/collections.service';
import { RatingService } from '../../../core/rating-module/rating.service';

@Component({
  selector: 'clark-modern-learning-card',
  templateUrl: './modern-learning-card.component.html',
  styleUrls: ['./modern-learning-card.component.scss']
})
export class ModernLearningCardComponent implements OnInit {
  @Input() learningObject: LearningObject;

  collections = new Map<string, string>();
  canDownload = false;
  averageRating = 0;
  reviewsCount = 0;

  constructor(
    private auth: AuthService,
    private collectionService: CollectionService,
    private ratingService: RatingService,
    private cd: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    // Load collections
    await this.loadCollections();

    // Load ratings
    await this.loadRatings();

    // Check download permissions
    this.canDownload = this.auth.isLoggedIn.value;
  }

  private async loadCollections() {
    try {
      const collections = await this.collectionService.getCollections();
      collections.forEach(collection => {
        this.collections.set(collection.abvName, collection.name);
      });
      this.cd.detectChanges();
    } catch (error) {
      console.warn('Failed to load collections for card:', error);
    }
  }

  private async loadRatings() {
    try {
      const ratings = await this.ratingService.getLearningObjectRatings(this.learningObject.cuid, this.learningObject.version);
      if (ratings.ratings.length > 0) {
        const totalRating = ratings.ratings.reduce((sum, rating) => sum + (rating.value || 0), 0);
        this.averageRating = totalRating / ratings.ratings.length;
        this.reviewsCount = ratings.ratings.length;
      }
      this.cd.detectChanges();
    } catch (error) {
      console.warn('Failed to load ratings for card:', error);
    }
  }

  getCollectionName(): string {
    const collectionName = this.collections.get(this.learningObject.collection);
    return collectionName || this.learningObject.collection?.toUpperCase() || 'GENERAL';
  }

  getDurationIcon(): string {
    switch (this.learningObject.length) {
      case 'nanomodule': return 'fas fa-clock';
      case 'micromodule': return 'fas fa-hourglass-half';
      case 'module': return 'fas fa-hourglass';
      case 'unit': return 'fas fa-hourglass-end';
      case 'course': return 'fas fa-calendar-alt';
      default: return 'fas fa-clock';
    }
  }

  getDurationText(): string {
    switch (this.learningObject.length) {
      case 'nanomodule': return '< 1 Hour';
      case 'micromodule': return '1-4 Hours';
      case 'module': return '4-10 Hours';
      case 'unit': return '10+ Hours';
      case 'course': return '15 Weeks';
      default: return this.learningObject.length?.toUpperCase() || '';
    }
  }

  getLevelDisplay(): string {
    if (!this.learningObject.levels || this.learningObject.levels.length === 0) {
      return 'All Levels';
    }

    const levelMap = {
      'undergraduate': 'Beginner',
      'graduate': 'Intermediate',
      'postgraduate': 'Advanced'
    };

    const mappedLevels = this.learningObject.levels.map(level =>
      levelMap[level.toLowerCase()] || level
    );

    return mappedLevels.join(', ');
  }

  getDisplayTags(): string[] {
    if (!this.learningObject.tags || this.learningObject.tags.length === 0) {
      return [];
    }
    return this.learningObject.tags.slice(0, 3); // Show only 3 tags in grid view
  }

  getDescription(): string {
    if (!this.learningObject.description) {
return '';
}

    // Strip HTML tags and truncate
    const plainText = this.learningObject.description.replace(/<[^>]*>/g, '');
    return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
  }

  organizationFormat(organization: string): string {
    return organization ? titleCase(organization) : '';
  }

  download(event: Event) {
    event.stopPropagation();
    // Add download logic here
    console.log('Download:', this.learningObject.name);
  }

  toggleBookmark(event: Event) {
    event.stopPropagation();
    // Add bookmark logic here
    console.log('Bookmark:', this.learningObject.name);
  }
}
