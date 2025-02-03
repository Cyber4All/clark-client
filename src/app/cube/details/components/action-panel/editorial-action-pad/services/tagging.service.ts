import { Injectable } from '@angular/core';
import { Topic, Tag } from '@entity';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TaggingService {
  private topics = new BehaviorSubject<Topic[]>([]);
  private tags = new BehaviorSubject<Tag[]>([]);

  private selectedTopics = new BehaviorSubject<Topic[]>([]);
  private selectedTags = new BehaviorSubject<Tag[]>([]);

  topics$: Observable<Topic[]> = this.topics.asObservable();
  tags$: Observable<Tag[]> = this.tags.asObservable();

  selectedTopics$: Observable<Topic[]> = this.selectedTopics.asObservable();
  selectedTags$: Observable<Tag[]> = this.selectedTags.asObservable();

  constructor() {}

  /**
   * Getters for topics and tags for final saves
   */

  get finalTopics() {
    return this.selectedTopics.value;
  }

  get finalTags() {
    return this.selectedTags.value;
  }

  /**
   * Initialize the available arrays (topics or tags).
   */
  setSourceArray(arrayName: 'topics' | 'tags', sourceArray: Topic[] | Tag[]): void {
    if (arrayName === 'topics') {
      this.topics.next(sourceArray as Topic[]);
    } else {
      this.tags.next(sourceArray as Tag[]);
    }
  }

  /**
   * Add an item to the selected array (topics or tags).
   */
  addItemToArray(arrayName: 'topics' | 'tags', item: Topic | Tag): void {
    const currentSelected = this.getSelectedArray(arrayName);
    const sourceArray = this.getSourceArray(arrayName);

    if (arrayName === 'topics') {
      if (
        (sourceArray as Topic[]).some((topic) => topic._id === (item as Topic)._id) &&
        !(currentSelected as Topic[]).some((selected) => selected._id === (item as Topic)._id)
      ) {
        const updatedSelected = [...(currentSelected as Topic[]), item as Topic];
        this.setSelectedArray(arrayName, updatedSelected);
      }
    } else if (arrayName === 'tags') {
      if (
        (sourceArray as Tag[]).includes(item as Tag) &&
        !(currentSelected as Tag[]).includes(item as Tag)
      ) {
        const updatedSelected = [...(currentSelected as Tag[]), item as Tag];
        this.setSelectedArray(arrayName, updatedSelected);
      }
    }
  }

  /**
   * Remove an item from the selected array (topics or tags).
   */
  removeItemFromArray(arrayName: 'topics' | 'tags', item: Topic | Tag): void {
    const currentSelected = this.getSelectedArray(arrayName);
    if (arrayName === 'topics') {
      const updatedSelected = (currentSelected as Topic[]).filter(
        (selected) => selected._id !== (item as Topic)._id
      );
      this.setSelectedArray(arrayName, updatedSelected);
    } else if (arrayName === 'tags') {
      const updatedSelected = (currentSelected as Tag[]).filter((selected) => selected !== item);
      this.setSelectedArray(arrayName, updatedSelected);
    }
  }

  /**
   * Toggle an item in the selected array (add if not present, remove if present).
   */
  toggleItemInArray(arrayName: 'topics' | 'tags', item: Topic | Tag): void {
    const currentSelected = this.getSelectedArray(arrayName);
    if (arrayName === 'topics') {
      if ((currentSelected as Topic[]).some((selected) => selected._id === (item as Topic)._id)) {
        this.removeItemFromArray(arrayName, item);
      } else {
        this.addItemToArray(arrayName, item);
      }
    } else if (arrayName === 'tags') {
      if ((currentSelected as Tag[]).includes(item as Tag)) {
        this.removeItemFromArray(arrayName, item);
      } else {
        this.addItemToArray(arrayName, item);
      }
    }
  }

  /**
   * Clear all selected items in a specific array.
   */
  clearSelectedArray(arrayName: 'topics' | 'tags'): void {
    this.setSelectedArray(arrayName, []);
  }

  /**
   * Get the selected array values (topics or tags).
   */
  private getSelectedArray(arrayName: 'topics' | 'tags'): Topic[] | Tag[] {
    return arrayName === 'topics' ? this.selectedTopics.value : this.selectedTags.value;
  }

  /**
   * Get the source array values (topics or tags).
   */
  private getSourceArray(arrayName: 'topics' | 'tags'): Topic[] | Tag[] {
    return arrayName === 'topics' ? this.topics.value : this.tags.value;
  }

  /**
   * Set the selected array values (topics or tags).
   */
  setSelectedArray(arrayName: 'topics' | 'tags', updatedArray: Topic[] | Tag[]): void {
    if (arrayName === 'topics') {
      this.selectedTopics.next(updatedArray as Topic[]);
    } else {
      this.selectedTags.next(updatedArray as Tag[]);
    }
  }
}

